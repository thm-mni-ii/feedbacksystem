package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.FrontendRedirectService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlSessionCleanupService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.verify
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.AuthenticationException

class SamlAuthFailureHandlerTest {

    @Test
    fun `onAuthenticationFailure redirects to frontend failure path and clears session`() {
        val frontendRedirectService = FrontendRedirectService("https://localhost")
        val samlSessionCleanupService = mock<SamlSessionCleanupService>()

        val handler = SamlAuthFailureHandler(
            frontendRedirectService = frontendRedirectService,
            samlSessionCleanupService = samlSessionCleanupService,
            failurePath = "/login?ssoError=1"
        )

        val request = MockHttpServletRequest()

        val response = MockHttpServletResponse()

        val exception = object : AuthenticationException("SAML failed") {}

        handler.onAuthenticationFailure(request, response, exception)

        assertEquals(302, response.status)
        assertEquals("https://localhost/login?ssoError=1", response.redirectedUrl)

        verify(samlSessionCleanupService).clearSession(request, response)
    }
}