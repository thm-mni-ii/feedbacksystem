package de.thm.ii.fbs.fbs_identity_service.security.saml

import de.thm.ii.fbs.fbs_identity_service.security.config.SecurityConfig
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.cors.CorsConfigurationSource
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class SamlCorsConfigTest {

    private val samlAuthSuccessHandler = mock(SamlAuthSuccessHandler::class.java)
    private val samlAuthFailureHandler = mock(SamlAuthFailureHandler::class.java)

    private val securityConfig = SecurityConfig(
        samlAuthSuccessHandler = samlAuthSuccessHandler,
        samlAuthFailureHandler = samlAuthFailureHandler,
        samlEnabled = true,
        samlRegistrationId = "keycloak"
    )

    @Test
    fun `cors configuration allows any origin for saml acs callback endpoint`() {
        val corsSource: CorsConfigurationSource = securityConfig.corsConfigurationSource(
            corsDevMode = false,
            allowedOrigins = "https://feedback.thm.de",
            frontendBaseUrl = "https://feedback.thm.de"
        )

        val request = MockHttpServletRequest("POST", "/login/saml2/sso/keycloak").apply {
            servletPath = "/login/saml2/sso/keycloak"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for SAML ACS endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://idp.thm.de", config.checkOrigin("https://idp.thm.de"))
        assertEquals("http://arbitrary-idp.example.org:8090", config.checkOrigin("http://arbitrary-idp.example.org:8090"))
        assertTrue(config.allowCredentials == true)
        assertTrue(config.allowedMethods?.containsAll(listOf("GET", "POST", "OPTIONS", "HEAD")) == true)
    }

    @Test
    fun `cors configuration allows any origin for saml metadata endpoint`() {
        val corsSource: CorsConfigurationSource = securityConfig.corsConfigurationSource(
            corsDevMode = false,
            allowedOrigins = "https://feedback.thm.de",
            frontendBaseUrl = "https://feedback.thm.de"
        )

        val request = MockHttpServletRequest("GET", "/saml2/metadata/keycloak").apply {
            servletPath = "/saml2/metadata/keycloak"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for SAML metadata endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://idp.thm.de", config.checkOrigin("https://idp.thm.de"))
    }

    @Test
    fun `cors configuration strictly enforces allowed origins for non-saml endpoints in production mode`() {
        val corsSource: CorsConfigurationSource = securityConfig.corsConfigurationSource(
            corsDevMode = false,
            allowedOrigins = "https://feedback.thm.de",
            frontendBaseUrl = "https://feedback.thm.de"
        )

        val request = MockHttpServletRequest("POST", "/graphql").apply {
            servletPath = "/graphql"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for general endpoints")
        assertEquals("https://feedback.thm.de", config.checkOrigin("https://feedback.thm.de"))
        assertNull(config.checkOrigin("https://untrusted-origin.example.com"))
    }
}
