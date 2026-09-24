package de.thm.ii.fbs.fbs_identity_service.security.saml

import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.AuthenticationException
import kotlin.test.assertEquals

class SamlAuthFailureHandlerTest {

    @Test
    fun `onAuthenticationFailure redirects to failure path`() {
        val handler = SamlAuthFailureHandler(
            failurePath = "/login?ssoError=1"
        )

        val request = MockHttpServletRequest()

        val response = MockHttpServletResponse()

        val exception = object : AuthenticationException("SAML failed") {}

        handler.onAuthenticationFailure(request, response, exception)

        assertEquals(302, response.status)
        assertEquals("/login?ssoError=1", response.redirectedUrl)
    }
}