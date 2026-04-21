package de.thm.ii.fbs.services.security

import org.bouncycastle.asn1.x500.X500Name
import org.bouncycastle.cert.jcajce.{JcaX509CertificateConverter, JcaX509v3CertificateBuilder}
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder
import org.opensaml.security.credential.UsageType
import org.opensaml.security.x509.BasicX509Credential

import java.math.BigInteger
import java.security.cert.X509Certificate
import java.security.{KeyPairGenerator, SecureRandom}
import java.time.Instant
import java.util.Date

/**
  * Generates an ephemeral self-signed RSA key-pair and X.509 certificate for use as
  * the SAML SP signing credential when no persistent credential is configured.
  */
object SelfSignedCredentialGenerator {
  case class GeneratedCredential(credential: BasicX509Credential, certificate: X509Certificate)

  def generate(cn: String): GeneratedCredential = {
    val kpg = KeyPairGenerator.getInstance("RSA")
    kpg.initialize(2048, new SecureRandom())
    val kp = kpg.generateKeyPair()

    val subject = new X500Name(s"CN=$cn, O=Feedbacksystem, C=DE")
    val notBefore = Date.from(Instant.now())
    val notAfter = Date.from(Instant.now().plusSeconds(10 * 365 * 24 * 3600L))
    val serial = BigInteger.valueOf(System.currentTimeMillis())

    val signer = new JcaContentSignerBuilder("SHA256WithRSAEncryption").build(kp.getPrivate)
    val certHolder = new JcaX509v3CertificateBuilder(subject, serial, notBefore, notAfter, subject, kp.getPublic)
      .build(signer)

    val cert = new JcaX509CertificateConverter().getCertificate(certHolder)

    val credential = new BasicX509Credential(cert, kp.getPrivate)
    credential.setUsageType(UsageType.SIGNING)

    GeneratedCredential(credential, cert)
  }
}
