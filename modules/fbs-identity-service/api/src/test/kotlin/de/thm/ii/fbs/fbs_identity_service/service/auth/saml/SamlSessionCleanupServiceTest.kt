package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.mock.web.MockHttpSession

class SamlSessionCleanupServiceTest {
    private val service = SamlSessionCleanupService()

    @Test
    fun `clearSession invalidates existing session`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val session = request.getSession(true) as MockHttpSession

        assertFalse(session.isInvalid)

        service.clearSession(request, response)

        assertTrue(session.isInvalid)
    }

    @Test
    fun `clearSession sets deletion cookie for JSESSIONID`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        request.isSecure = true

        service.clearSession(request, response)

        val setCookieHeaders = response.getHeaders(HttpHeaders.SET_COOKIE)

        assertTrue(
            setCookieHeaders.any {
                it.startsWith("JSESSIONID=") &&
                        it.contains("Path=/") &&
                        it.contains("Max-Age=0") &&
                        it.contains("HttpOnly") &&
                        it.contains("Secure")
            }
        )
    }
}