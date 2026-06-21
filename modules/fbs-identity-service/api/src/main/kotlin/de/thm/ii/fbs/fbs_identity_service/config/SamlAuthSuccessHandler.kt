package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlLoginService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException

@Component
class SamlAuthSuccessHandler(

    private val samlLoginService: SamlLoginService,

    @param:Value("\${app.saml.principal-attribute:uid}")
    private val principalAttribute: String,

    @param:Value("\${app.saml.prename-attribute:givenName}")
    private val prenameAttribute: String,

    @param:Value("\${app.saml.surname-attribute:sn}")
    private val surnameAttribute: String,

    @param:Value("\${app.saml.email-attribute:mail}")
    private val emailAttribute: String,

    @param:Value("\${app.saml.success-url:/login}")
    private val successUrl: String,

    @param:Value("\${app.saml.failure-url:/login?ssoError=1}")
    private val failureUrl: String


) : AuthenticationSuccessHandler {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
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

        // TODO: final klären: Cookie + Redirect oder anderer Token-Übergabemechanismus
        response.status = HttpServletResponse.SC_OK
        response.contentType = "application/json"
        response.writer.write(
            """
            {
              "accessToken": "${loginResponse.accessToken}",
              "tokenType": "${loginResponse.tokenType}",
              "expiresIn": ${loginResponse.expiresIn}
            }
            """.trimIndent()
        )
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