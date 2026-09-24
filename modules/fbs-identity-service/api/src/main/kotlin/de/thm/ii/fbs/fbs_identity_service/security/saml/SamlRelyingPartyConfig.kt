package de.thm.ii.fbs.fbs_identity_service.security.saml

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.saml2.core.Saml2X509Credential
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations
import java.io.FileInputStream
import java.security.KeyStore
import java.security.PrivateKey
import java.security.cert.X509Certificate

@Configuration
@ConditionalOnProperty(prefix = "app.saml", name = ["enabled"], havingValue = "true")
class SamlRelyingPartyConfig(
    @param:Value("\${app.saml.registration-id:keycloak}")
    private val registrationId: String,

    @param:Value("\${app.saml.idp-metadata-uri:}")
    private val idpMetadataUri: String,

    @param:Value("\${app.saml.idp-entity-id:}")
    private val idpEntityId: String,

    @param:Value("\${app.saml.idp-sso-url:}")
    private val idpSsoUrl: String,

    @param:Value("\${app.saml.sp-entity-id:}")
    private val spEntityId: String,

    @param:Value("\${app.frontend.base-url:https://localhost}")
    private val frontendBaseUrl: String,

    @param:Value("\${security.oidc.signing-key.location}")
    private val keyStoreLocation: String,

    @param:Value("\${security.oidc.signing-key.store-password}")
    private val keyStorePassword: String,

    @param:Value("\${security.oidc.signing-key.alias:identity-signing}")
    private val keyAlias: String,

    @param:Value("\${security.oidc.signing-key.key-password}")
    private val keyPassword: String
) {
    private val log = LoggerFactory.getLogger(SamlRelyingPartyConfig::class.java)

    @Bean
    fun relyingPartyRegistrationRepository(): RelyingPartyRegistrationRepository {
        val keyStore = KeyStore.getInstance("PKCS12")
        FileInputStream(keyStoreLocation).use { inputStream ->
            keyStore.load(inputStream, keyStorePassword.toCharArray())
        }

        val privateKey = checkNotNull(keyStore.getKey(keyAlias, keyPassword.toCharArray()) as? PrivateKey) {
            "No private key found for alias '$keyAlias' in keystore"
        }

        val certificate = checkNotNull(keyStore.getCertificate(keyAlias) as? X509Certificate) {
            "No X509 certificate found for alias '$keyAlias' in keystore"
        }

        val signingCredential = Saml2X509Credential(
            privateKey,
            certificate,
            Saml2X509Credential.Saml2X509CredentialType.SIGNING,
            Saml2X509Credential.Saml2X509CredentialType.DECRYPTION
        )

        val entityId = if (spEntityId.isNotBlank()) {
            spEntityId
        } else {
            "${frontendBaseUrl.trimEnd('/')}/saml2/metadata/$registrationId"
        }

        val builder: RelyingPartyRegistration.Builder = if (idpMetadataUri.isNotBlank()) {
            RelyingPartyRegistrations.fromMetadataLocation(idpMetadataUri)
        } else {
            val defaultIdpEntityId = if (idpEntityId.isNotBlank()) idpEntityId else "https://idp.thm.de/idp/shibboleth"
            val defaultSsoUrl = if (idpSsoUrl.isNotBlank()) idpSsoUrl else "https://idp.thm.de/idp/profile/SAML2/Redirect/SSO"
            RelyingPartyRegistration.withRegistrationId(registrationId)
                .assertingPartyDetails { party ->
                    party.entityId(defaultIdpEntityId)
                    party.singleSignOnServiceLocation(defaultSsoUrl)
                    party.wantAuthnRequestsSigned(false)
                }
        }

        val registration = builder
            .registrationId(registrationId)
            .entityId(entityId)
            .assertionConsumerServiceLocation("{baseUrl}/login/saml2/sso/{registrationId}")
            .signingX509Credentials { it.add(signingCredential) }
            .decryptionX509Credentials { it.add(signingCredential) }
            .build()

        log.info("Initialized SAML 2.0 RelyingPartyRegistration for registration-id '{}' with entity-id '{}'", registrationId, entityId)

        return InMemoryRelyingPartyRegistrationRepository(registration)
    }
}
