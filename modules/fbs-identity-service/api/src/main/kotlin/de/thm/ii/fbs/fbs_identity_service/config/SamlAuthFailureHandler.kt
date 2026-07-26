package de.thm.ii.fbs.fbs_identity_service.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.stereotype.Component

@Component
class SamlAuthFailureHandler(

    @param:Value("\${app.saml.failure-path:/login?ssoError=1}")
    private val failurePath: String

) : AuthenticationFailureHandler {

    private val log = LoggerFactory.getLogger(SamlAuthFailureHandler::class.java)

    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        log.warn(
            "SAML login failed for request URI {}: {}",
            request.requestURI,
            exception.message,
            exception
        )

        response.sendRedirect(failurePath)
    }
}
