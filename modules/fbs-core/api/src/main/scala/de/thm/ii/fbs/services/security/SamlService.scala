package de.thm.ii.fbs.services.security

import net.shibboleth.utilities.java.support.xml.SerializeSupport
import org.opensaml.core.config.InitializationService
import org.opensaml.core.xml.config.XMLObjectProviderRegistrySupport
import org.opensaml.core.xml.io.MarshallingException
import org.opensaml.saml.common.xml.SAMLConstants
import org.opensaml.saml.saml2.core._
import org.opensaml.saml.saml2.metadata._
import org.opensaml.security.credential.{Credential, UsageType}
import org.opensaml.security.x509.BasicX509Credential
import org.opensaml.xmlsec.signature.support.SignatureException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.w3c.dom.Element

import java.io.{ByteArrayInputStream, StringWriter}
import java.nio.charset.StandardCharsets
import java.security.KeyFactory
import java.security.cert.{CertificateFactory, X509Certificate}
import java.security.spec.PKCS8EncodedKeySpec
import java.time.Instant
import java.util.{Base64, UUID}
import javax.annotation.PostConstruct
import javax.servlet.http.HttpServletRequest
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult

/**
  * Holds all user-relevant attributes extracted from a SAML assertion.
  *
  * @param username  the principal identifier (from the configured attribute or NameID)
  * @param prename   given name (may be empty if the IdP does not release it)
  * @param surname   family name (may be empty if the IdP does not release it)
  * @param email     e-mail address (may be empty if the IdP does not release it)
  */
case class SamlUser(username: String, prename: String, surname: String, email: String)

/**
  * Handles the SAML 2.0 Service Provider (SP) side entirely within the application.
  *
  * Responsibilities:
  *  - Expose SP metadata at /saml/metadata
  *  - Build redirect-binding AuthnRequest URLs to send the browser to the IdP
  *  - Validate and parse the POST-binding SAMLResponse from the IdP
  *  - Extract the principal (NameID) from a successfully validated assertion
  *
  * Configuration is driven by the `saml.sp.*` and `saml.idp.*` keys in application.yml.
  * For development, self-signed credentials are generated at startup when no PEM values
  * are provided.
  */
@Service
class SamlService(
  @Value("${saml.sp.entity-id:${SERVER_HOST:https://localhost}/saml/metadata}")
  private val spEntityId: String,
  @Value("${saml.sp.acs-url:${SERVER_HOST:https://localhost}/saml/acs}")
  private val acsUrl: String,
  @Value("${saml.sp.slo-url:${SERVER_HOST:https://localhost}/api/v1/logout}")
  private val sloUrl: String,
  /** Base64-DER-encoded PKCS8 private key (no PEM headers). Leave blank to auto-generate. */
  @Value("${saml.sp.private-key:}")
  private val spPrivateKeyB64: String,
  /** Base64-DER-encoded X.509 certificate (no PEM headers). Leave blank to auto-generate. */
  @Value("${saml.sp.certificate:}")
  private val spCertificateB64: String,
  /** IdP SSO endpoint (HTTP-Redirect binding) */
  @Value("${saml.idp.sso-url:http://localhost:8080/simplesaml/saml2/idp/SSOService.php}")
  private val idpSsoUrl: String,
  /** Base64-DER-encoded IdP signing certificate (no PEM headers). May be empty to skip validation. */
  @Value("${saml.idp.certificate:}")
  private val idpCertificateB64: String,
  /** SAML attribute name that holds the user identifier returned in the assertion. */
  @Value("${saml.sp.principal-attribute:uid}")
  private val principalAttribute: String,
  /** SAML attribute name for the user's given name. */
  @Value("${saml.sp.prename-attribute:givenName}")
  private val prenameAttribute: String,
  /** SAML attribute name for the user's family name. */
  @Value("${saml.sp.surname-attribute:sn}")
  private val surnameAttribute: String,
  /** SAML attribute name for the user's e-mail address. */
  @Value("${saml.sp.mail-attribute:mail}")
  private val mailAttribute: String
) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private var spCredential: Credential = _
  private var spCertificate: X509Certificate = _
  private var idpCredential: Option[Credential] = None

  // -------------------------------------------------------------------------
  // Initialisation
  // -------------------------------------------------------------------------

  @PostConstruct
  def init(): Unit = {
    // Bootstrap OpenSAML
    InitializationService.initialize()

    if (spPrivateKeyB64.nonEmpty && spCertificateB64.nonEmpty) {
      spCredential = loadCredential(spPrivateKeyB64, spCertificateB64)
      spCertificate = loadCertificate(spCertificateB64)
      logger.info("SAML SP: loaded credential from configuration")
    } else {
      val generated = SelfSignedCredentialGenerator.generate("localhost")
      spCredential = generated.credential
      spCertificate = generated.certificate
      logger.warn("SAML SP: no credential configured — using ephemeral self-signed certificate. " +
        "Set saml.sp.private-key and saml.sp.certificate for a stable credential.")
    }

    if (idpCertificateB64.nonEmpty) {
      idpCredential = Some(loadSigningCredential(idpCertificateB64))
      logger.info("SAML SP: IdP signing certificate loaded — responses will be signature-validated")
    } else {
      logger.warn("SAML SP: no IdP certificate configured (saml.idp.certificate). " +
        "Signature validation of IdP responses is DISABLED. Suitable for development only.")
    }
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
    * Returns the SP metadata XML as a string.
    * Expose this at GET /saml/metadata so the IdP can import it.
    */
  def buildMetadataXml(): String = {
    val descriptor = buildEntityDescriptor()
    marshalToString(descriptor)
  }

  /**
    * Builds the redirect URL to send the browser to the IdP for authentication.
    *
    * @param relayState opaque value passed through the SAML flow and returned at the ACS
    * @return full URL including SAMLRequest and RelayState query parameters
    */
  def buildAuthnRequestRedirectUrl(relayState: String): String = {
    val authnRequest = buildAuthnRequest()
    val encoded = DeflateEncoder.encode(marshalToString(authnRequest))
    val relayStateEncoded = java.net.URLEncoder.encode(relayState, StandardCharsets.UTF_8.name())
    s"$idpSsoUrl?SAMLRequest=$encoded&RelayState=$relayStateEncoded"
  }

  /**
    * Validates the base64-encoded SAMLResponse POST parameter and extracts the principal.
    *
    * @param samlResponseB64 the raw value of the `SAMLResponse` form parameter
    * @param request the incoming HTTP request (used for ACS URL validation)
    * @return the principal identifier (NameID or configured attribute value), or None on failure
    */
  def extractPrincipal(samlResponseB64: String, request: HttpServletRequest): Option[String] =
    extractUser(samlResponseB64, request).map(_.username)

  /**
    * Validates the base64-encoded SAMLResponse POST parameter and extracts the full user profile.
    *
    * In addition to the principal identifier, this method also returns the user's given name,
    * family name and e-mail address as released by the IdP.  These values are used to
    * auto-provision a new application user when no LDAP directory is available.
    *
    * @param samlResponseB64 the raw value of the `SAMLResponse` form parameter
    * @param request the incoming HTTP request (used for ACS URL validation)
    * @return a [[SamlUser]] with the extracted attributes, or None on failure
    */
  def extractUser(samlResponseB64: String, request: HttpServletRequest): Option[SamlUser] = {
    try {
      val xml = new String(Base64.getDecoder.decode(samlResponseB64), StandardCharsets.UTF_8)
      val response = parseResponse(xml)

      validateStatus(response)
      validateDestination(response)

      val assertions = response.getAssertions
      if (assertions.isEmpty) {
        logger.warn("SAML response contains no assertions")
        None
      } else {
        val assertion = assertions.get(0)

        idpCredential.foreach { cred =>
          validateAssertionSignature(assertion, cred)
        }

        extractPrincipalFromAssertion(assertion).map { username =>
          val attrs = extractAttributeMap(assertion)
          SamlUser(
            username = username,
            prename  = attrs.getOrElse(prenameAttribute, ""),
            surname  = attrs.getOrElse(surnameAttribute, ""),
            email    = attrs.getOrElse(mailAttribute, "")
          )
        }
      }
    } catch {
      case e: Exception =>
        logger.error("SAML response processing failed", e)
        None
    }
  }

  // -------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------

  private def buildEntityDescriptor(): EntityDescriptor = {
    val builder = XMLObjectProviderRegistrySupport.getBuilderFactory
    val ed = builder.getBuilder(EntityDescriptor.DEFAULT_ELEMENT_NAME)
      .buildObject(EntityDescriptor.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[EntityDescriptor]
    ed.setEntityID(spEntityId)

    val spDescriptor = builder.getBuilder(SPSSODescriptor.DEFAULT_ELEMENT_NAME)
      .buildObject(SPSSODescriptor.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[SPSSODescriptor]
    spDescriptor.addSupportedProtocol(SAMLConstants.SAML20P_NS)
    spDescriptor.setAuthnRequestsSigned(false)
    spDescriptor.setWantAssertionsSigned(false)

    // Key descriptor for signing/encryption
    val keyDescriptor = builder.getBuilder(KeyDescriptor.DEFAULT_ELEMENT_NAME)
      .buildObject(KeyDescriptor.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[KeyDescriptor]
    keyDescriptor.setUse(UsageType.SIGNING)

    val keyInfo = buildKeyInfo()
    keyDescriptor.setKeyInfo(keyInfo)
    spDescriptor.getKeyDescriptors.add(keyDescriptor)

    // ACS
    val acs = builder.getBuilder(AssertionConsumerService.DEFAULT_ELEMENT_NAME)
      .buildObject(AssertionConsumerService.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[AssertionConsumerService]
    acs.setBinding(SAMLConstants.SAML2_POST_BINDING_URI)
    acs.setLocation(acsUrl)
    acs.setIndex(0)
    acs.setIsDefault(true)
    spDescriptor.getAssertionConsumerServices.add(acs)

    // SLO
    val slo = builder.getBuilder(SingleLogoutService.DEFAULT_ELEMENT_NAME)
      .buildObject(SingleLogoutService.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[SingleLogoutService]
    slo.setBinding(SAMLConstants.SAML2_REDIRECT_BINDING_URI)
    slo.setLocation(sloUrl)
    spDescriptor.getSingleLogoutServices.add(slo)

    ed.getRoleDescriptors.add(spDescriptor)
    ed
  }

  private def buildKeyInfo(): org.opensaml.xmlsec.signature.KeyInfo = {
    val builder = XMLObjectProviderRegistrySupport.getBuilderFactory
    val keyInfo = builder.getBuilder(org.opensaml.xmlsec.signature.KeyInfo.DEFAULT_ELEMENT_NAME)
      .buildObject(org.opensaml.xmlsec.signature.KeyInfo.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[org.opensaml.xmlsec.signature.KeyInfo]

    val x509Data = builder.getBuilder(org.opensaml.xmlsec.signature.X509Data.DEFAULT_ELEMENT_NAME)
      .buildObject(org.opensaml.xmlsec.signature.X509Data.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[org.opensaml.xmlsec.signature.X509Data]

    val x509Cert = builder.getBuilder(org.opensaml.xmlsec.signature.X509Certificate.DEFAULT_ELEMENT_NAME)
      .buildObject(org.opensaml.xmlsec.signature.X509Certificate.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[org.opensaml.xmlsec.signature.X509Certificate]

    x509Cert.setValue(Base64.getEncoder.encodeToString(spCertificate.getEncoded))
    x509Data.getX509Certificates.add(x509Cert)
    keyInfo.getX509Datas.add(x509Data)
    keyInfo
  }

  // -------------------------------------------------------------------------
  // AuthnRequest
  // -------------------------------------------------------------------------

  private def buildAuthnRequest(): AuthnRequest = {
    val builder = XMLObjectProviderRegistrySupport.getBuilderFactory
    val authnRequest = builder.getBuilder(AuthnRequest.DEFAULT_ELEMENT_NAME)
      .buildObject(AuthnRequest.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[AuthnRequest]

    authnRequest.setID("_" + UUID.randomUUID().toString.replace("-", ""))
    authnRequest.setIssueInstant(Instant.now())
    authnRequest.setDestination(idpSsoUrl)
    authnRequest.setProtocolBinding(SAMLConstants.SAML2_POST_BINDING_URI)
    authnRequest.setAssertionConsumerServiceURL(acsUrl)

    val issuer = builder.getBuilder(Issuer.DEFAULT_ELEMENT_NAME)
      .buildObject(Issuer.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[Issuer]
    issuer.setValue(spEntityId)
    authnRequest.setIssuer(issuer)

    val nameIDPolicy = builder.getBuilder(NameIDPolicy.DEFAULT_ELEMENT_NAME)
      .buildObject(NameIDPolicy.DEFAULT_ELEMENT_NAME)
      .asInstanceOf[NameIDPolicy]
    nameIDPolicy.setAllowCreate(true)
    authnRequest.setNameIDPolicy(nameIDPolicy)

    authnRequest
  }

  // -------------------------------------------------------------------------
  // Response parsing & validation
  // -------------------------------------------------------------------------

  private def parseResponse(xml: String): Response = {
    val parserPool = XMLObjectProviderRegistrySupport.getParserPool
    val document = parserPool.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)))
    val root = document.getDocumentElement
    val unmarshaller = XMLObjectProviderRegistrySupport.getUnmarshallerFactory.getUnmarshaller(root)
    unmarshaller.unmarshall(root).asInstanceOf[Response]
  }

  private def validateStatus(response: Response): Unit = {
    val statusCode = response.getStatus.getStatusCode.getValue
    if (statusCode != StatusCode.SUCCESS) {
      throw new IllegalStateException(s"SAML response has non-success status: $statusCode")
    }
  }

  private def validateDestination(response: Response): Unit = {
    val destination = response.getDestination
    if (destination != null && destination.nonEmpty && destination != acsUrl) {
      throw new IllegalStateException(
        s"SAML response destination '$destination' does not match expected ACS URL '$acsUrl'")
    }
  }

  private def validateAssertionSignature(assertion: Assertion, credential: Credential): Unit = {
    if (assertion.isSigned) {
      try {
        org.opensaml.xmlsec.signature.support.SignatureValidator.validate(assertion.getSignature, credential)
      } catch {
        case e: SignatureException =>
          throw new IllegalStateException("SAML assertion signature validation failed", e)
      }
    } else {
      logger.warn("SAML assertion is not signed — skipping signature check")
    }
  }

  private def extractAttributeMap(assertion: Assertion): Map[String, String] = {
    val attributes = assertion.getAttributeStatements
    if (attributes.isEmpty) {
      Map.empty
    } else {
      attributes.get(0).getAttributes.toArray
        .map(_.asInstanceOf[org.opensaml.saml.saml2.core.Attribute])
        .flatMap { attr =>
          val values = attr.getAttributeValues
          if (values.isEmpty) None
          else Option(values.get(0).getDOM).map(dom => attr.getName -> dom.getTextContent.trim)
        }
        .toMap
    }
  }

  private def extractPrincipalFromAssertion(assertion: Assertion): Option[String] = {
    // 1. Try configured attribute first
    val attributes = assertion.getAttributeStatements
    if (!attributes.isEmpty) {
      attributes.get(0).getAttributes.toArray
        .map(_.asInstanceOf[org.opensaml.saml.saml2.core.Attribute])
        .find(_.getName == principalAttribute)
        .flatMap { attr =>
          val values = attr.getAttributeValues
          if (values.isEmpty) { None }
          else { Option(values.get(0).getDOM).map(_.getTextContent.trim).filter(_.nonEmpty) }
        }
    } else { None }
  }.orElse {
    // 2. Fall back to NameID
    Option(assertion.getSubject)
      .flatMap(s => Option(s.getNameID))
      .map(_.getValue.trim)
      .filter(_.nonEmpty)
  }

  // -------------------------------------------------------------------------
  // Marshalling helpers
  // -------------------------------------------------------------------------

  private def marshalToString(xmlObject: org.opensaml.core.xml.XMLObject): String = {
    val marshaller = XMLObjectProviderRegistrySupport.getMarshallerFactory.getMarshaller(xmlObject)
    if (marshaller == null) throw new MarshallingException(s"No marshaller for ${xmlObject.getClass.getName}")
    val element: Element = marshaller.marshall(xmlObject)
    val writer = new StringWriter()
    val transformer = TransformerFactory.newInstance().newTransformer()
    transformer.transform(new DOMSource(element), new StreamResult(writer))
    writer.toString
  }

  // -------------------------------------------------------------------------
  // Credential loading
  // -------------------------------------------------------------------------

  private def loadCredential(privateKeyB64: String, certB64: String): Credential = {
    val cert = loadCertificate(certB64)
    val keyBytes = Base64.getDecoder.decode(privateKeyB64.replaceAll("\\s", ""))
    val keySpec = new PKCS8EncodedKeySpec(keyBytes)
    val privateKey = KeyFactory.getInstance("RSA").generatePrivate(keySpec)
    val cred = new BasicX509Credential(cert, privateKey)
    cred.setUsageType(UsageType.SIGNING)
    cred
  }

  private def loadSigningCredential(certB64: String): Credential = {
    val cert = loadCertificate(certB64)
    val cred = new BasicX509Credential(cert)
    cred.setUsageType(UsageType.SIGNING)
    cred
  }

  private def loadCertificate(certB64: String): X509Certificate = {
    val derBytes = Base64.getDecoder.decode(certB64.replaceAll("\\s", ""))
    CertificateFactory.getInstance("X.509")
      .generateCertificate(new ByteArrayInputStream(derBytes))
      .asInstanceOf[X509Certificate]
  }
}
