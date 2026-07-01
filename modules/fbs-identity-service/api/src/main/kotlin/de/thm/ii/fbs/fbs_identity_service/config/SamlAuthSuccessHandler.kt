package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.FrontendRedirectService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlLoginService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlSessionCleanupService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.security.core.Authentication
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpHeaders
import org.slf4j.LoggerFactory

@Component
class SamlAuthSuccessHandler(

    private val samlLoginService: SamlLoginService,

    private val frontendRedirectService: FrontendRedirectService,

    private val samlSessionCleanupService: SamlSessionCleanupService,

    @param:Value("\${app.saml.principal-attribute:uid}")
    private val principalAttribute: String,

    @param:Value("\${app.saml.prename-attribute:givenName}")
    private val prenameAttribute: String,

    @param:Value("\${app.saml.surname-attribute:sn}")
    private val surnameAttribute: String,

    @param:Value("\${app.saml.email-attribute:mail}")
    private val emailAttribute: String,

    @param:Value("\${app.saml.jwt-cookie-name:jwt}")
    private val jwtCookieName: String,

    @param:Value("\${app.saml.jwt-cookie-max-age-seconds:30}")
    private val jwtCookieMaxAgeSeconds: Long,

    @param:Value("\${app.saml.success-path:/login}")
    private val successPath: String,

    @param:Value("\${app.saml.failure-path:/login?ssoError=1}")
    private val failurePath: String

) : AuthenticationSuccessHandler {

    private val log = LoggerFactory.getLogger(SamlAuthSuccessHandler::class.java)

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        try {
            val principal = authentication.principal as? Saml2AuthenticatedPrincipal
                ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid SAML principal")

            val username = firstAttribute(principal, principalAttribute)
                ?: throw ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Required SAML principal attribute is missing"
                )

            val samlUser = SamlUser(
                username = username,
                prename = firstAttribute(principal, prenameAttribute) ?: "",
                surname = firstAttribute(principal, surnameAttribute) ?: "",
                email = firstAttribute(principal, emailAttribute) ?: ""
            )

            val loginResponse = samlLoginService.login(samlUser)

            val jwtCookie = ResponseCookie.from(jwtCookieName, loginResponse.accessToken)
                .httpOnly(false)
                .maxAge(jwtCookieMaxAgeSeconds)
                .path("/")
                .sameSite("Lax")
                .secure(request.isSecure)
                .build()

            samlSessionCleanupService.clearSession(request, response)

            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString())

            response.sendRedirect(frontendRedirectService.buildRedirectUrl(successPath))
        } catch (exception: Exception) {
            log.warn("SAML login post-processing failed: {}", exception.message, exception)

            samlSessionCleanupService.clearSession(request, response)

            response.sendRedirect(frontendRedirectService.buildRedirectUrl(failurePath))
        }
    }

    private fun firstAttribute(
        principal: Saml2AuthenticatedPrincipal,
        name: String
    ): String? {
        return principal.getAttribute<Any>(name)
            ?.firstOrNull()
            ?.toString()
            ?.trim()
            ?.takeIf { it.isNotBlank() }
    }
}