package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.security.config.SecurityConfig
import de.thm.ii.fbs.fbs_identity_service.security.saml.SamlAuthFailureHandler
import de.thm.ii.fbs.fbs_identity_service.security.saml.SamlAuthSuccessHandler
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.cors.CorsConfigurationSource
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class OidcCorsConfigTest {

    private val samlAuthSuccessHandler = mock(SamlAuthSuccessHandler::class.java)
    private val samlAuthFailureHandler = mock(SamlAuthFailureHandler::class.java)

    private val securityConfig = SecurityConfig(
        samlAuthSuccessHandler = samlAuthSuccessHandler,
        samlAuthFailureHandler = samlAuthFailureHandler,
        samlEnabled = true,
        samlRegistrationId = "keycloak"
    )

    private val corsSource: CorsConfigurationSource = securityConfig.corsConfigurationSource(
        corsDevMode = false,
        allowedOrigins = "https://feedback.thm.de",
        frontendBaseUrl = "https://feedback.thm.de"
    )

    @Test
    fun `cors configuration allows any origin for openid discovery endpoint without credentials`() {
        val request = MockHttpServletRequest("GET", "/.well-known/openid-configuration").apply {
            servletPath = "/.well-known/openid-configuration"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for discovery endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://client-spa.example.org", config.checkOrigin("https://client-spa.example.org"))
        assertFalse(config.allowCredentials ?: true, "Credentials must be disabled for public discovery")
        assertTrue(config.allowedMethods?.containsAll(listOf("GET", "OPTIONS", "HEAD")) == true)
    }

    @Test
    fun `cors configuration allows any origin for jwks endpoint without credentials`() {
        val request = MockHttpServletRequest("GET", "/oauth2/jwks").apply {
            servletPath = "/oauth2/jwks"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for jwks endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://client-spa.example.org", config.checkOrigin("https://client-spa.example.org"))
        assertFalse(config.allowCredentials ?: true, "Credentials must be disabled for jwks")
        assertTrue(config.allowedMethods?.containsAll(listOf("GET", "OPTIONS", "HEAD")) == true)
    }

    @Test
    fun `cors configuration allows any origin for token endpoint without credentials`() {
        val request = MockHttpServletRequest("POST", "/oauth2/token").apply {
            servletPath = "/oauth2/token"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for token endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://client-spa.example.org", config.checkOrigin("https://client-spa.example.org"))
        assertFalse(config.allowCredentials ?: true, "Credentials must be disabled for token endpoint")
        assertTrue(config.allowedMethods?.containsAll(listOf("POST", "OPTIONS")) == true)
    }

    @Test
    fun `cors configuration allows any origin for userinfo endpoint without credentials`() {
        val request = MockHttpServletRequest("GET", "/userinfo").apply {
            servletPath = "/userinfo"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for userinfo endpoint")
        assertEquals(listOf("*"), config.allowedOriginPatterns)
        assertEquals("https://client-spa.example.org", config.checkOrigin("https://client-spa.example.org"))
        assertFalse(config.allowCredentials ?: true, "Credentials must be disabled for userinfo endpoint")
        assertTrue(config.allowedMethods?.containsAll(listOf("GET", "POST", "OPTIONS", "HEAD")) == true)
    }

    @Test
    fun `cors configuration strictly enforces allowed origins for non-oidc endpoints`() {
        val request = MockHttpServletRequest("POST", "/graphql").apply {
            servletPath = "/graphql"
        }

        val config = corsSource.getCorsConfiguration(request)
        assertNotNull(config, "CORS config should be present for general endpoints")
        assertEquals("https://feedback.thm.de", config.checkOrigin("https://feedback.thm.de"))
        assertNull(config.checkOrigin("https://untrusted-origin.example.com"))
        assertTrue(config.allowCredentials == true)
    }
}
