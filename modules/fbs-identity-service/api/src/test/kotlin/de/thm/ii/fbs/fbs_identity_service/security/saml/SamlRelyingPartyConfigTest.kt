package de.thm.ii.fbs.fbs_identity_service.security.saml

import org.junit.jupiter.api.Test
import org.springframework.security.saml2.core.Saml2X509Credential
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SamlRelyingPartyConfigTest {

    private val keyStorePath = File("src/test/resources/identity-signing-test.p12").absolutePath
    private val keyStorePassword = "changeit"
    private val keyAlias = "identity-signing-test"
    private val keyPassword = "changeit"

    @Test
    fun `acs url is derived from frontend-base-url when sp-acs-url is not set`() {
        val config = SamlRelyingPartyConfig(
            registrationId = "thm",
            idpMetadataUri = "",
            idpEntityId = "https://idp.thm.de/idp/shibboleth",
            idpSsoUrl = "https://idp.thm.de/idp/profile/SAML2/Redirect/SSO",
            spEntityId = "",
            spAcsUrl = "",
            signRequest = false,
            frontendBaseUrl = "https://feedback.thm.de/",
            keyStoreLocation = keyStorePath,
            keyStorePassword = keyStorePassword,
            keyAlias = keyAlias,
            keyPassword = keyPassword
        )

        val repository = config.relyingPartyRegistrationRepository()
        val registration = repository.findByRegistrationId("thm")

        assertEquals("https://feedback.thm.de/login/saml2/sso/thm", registration.assertionConsumerServiceLocation)
        assertEquals("https://feedback.thm.de/saml2/metadata/thm", registration.entityId)
        assertTrue(registration.signingX509Credentials.isEmpty(), "Signing credentials should be empty when signRequest is false")
        assertFalse(registration.decryptionX509Credentials.isEmpty(), "Decryption credentials should be present")
    }

    @Test
    fun `explicit sp-acs-url overrides frontend-base-url`() {
        val config = SamlRelyingPartyConfig(
            registrationId = "custom-idp",
            idpMetadataUri = "",
            idpEntityId = "https://custom-idp.example.com",
            idpSsoUrl = "https://custom-idp.example.com/sso",
            spEntityId = "https://feedback.thm.de/custom-entity-id",
            spAcsUrl = "https://feedback.thm.de/custom/sso/callback",
            signRequest = true,
            frontendBaseUrl = "https://feedback.thm.de",
            keyStoreLocation = keyStorePath,
            keyStorePassword = keyStorePassword,
            keyAlias = keyAlias,
            keyPassword = keyPassword
        )

        val repository = config.relyingPartyRegistrationRepository()
        val registration = repository.findByRegistrationId("custom-idp")

        assertEquals("https://feedback.thm.de/custom/sso/callback", registration.assertionConsumerServiceLocation)
        assertEquals("https://feedback.thm.de/custom-entity-id", registration.entityId)
        assertFalse(registration.signingX509Credentials.isEmpty(), "Signing credentials should be present when signRequest is true")
        assertEquals(Saml2X509Credential.Saml2X509CredentialType.SIGNING, registration.signingX509Credentials.first().credentialTypes.first())
    }

    @Test
    fun `fallback to placeholder acs url when frontend-base-url and sp-acs-url are blank`() {
        val config = SamlRelyingPartyConfig(
            registrationId = "fallback-test",
            idpMetadataUri = "",
            idpEntityId = "",
            idpSsoUrl = "",
            spEntityId = "",
            spAcsUrl = "",
            signRequest = false,
            frontendBaseUrl = "",
            keyStoreLocation = keyStorePath,
            keyStorePassword = keyStorePassword,
            keyAlias = keyAlias,
            keyPassword = keyPassword
        )

        val repository = config.relyingPartyRegistrationRepository()
        val registration = repository.findByRegistrationId("fallback-test")

        assertEquals("{baseUrl}/login/saml2/sso/{registrationId}", registration.assertionConsumerServiceLocation)
        assertEquals("/saml2/metadata/fallback-test", registration.entityId)
    }
}
