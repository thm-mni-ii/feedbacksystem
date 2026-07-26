package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.exception.InvalidSamlPrincipalException
import de.thm.ii.fbs.fbs_identity_service.exception.MissingSamlPrincipalAttributeException
import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.security.local.IdentityUserPrincipal
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlLoginService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.security.web.savedrequest.HttpSessionRequestCache

@Component
class SamlAuthSuccessHandler(

    private val samlLoginService: SamlLoginService,

    private val securityContextRepository: SecurityContextRepository,

    @param:Value("\${app.saml.principal-attribute:uid}")
    private val principalAttribute: String,

    @param:Value("\${app.saml.prename-attribute:givenName}")
    private val prenameAttribute: String,

    @param:Value("\${app.saml.surname-attribute:sn}")
    private val surnameAttribute: String,

    @param:Value("\${app.saml.email-attribute:mail}")
    private val emailAttribute: String,

    @param:Value("\${app.saml.failure-path:/login?ssoError=1}")
    private val failurePath: String

) : AuthenticationSuccessHandler {

    private val log = LoggerFactory.getLogger(SamlAuthSuccessHandler::class.java)

    private val requestCache = HttpSessionRequestCache()

    private val authenticationSuccessHandler =
        SavedRequestAwareAuthenticationSuccessHandler()

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        try {
            val principal = authentication.principal as? Saml2AuthenticatedPrincipal
                ?: throw InvalidSamlPrincipalException()

            val username = firstAttribute(principal, principalAttribute)
                ?: throw MissingSamlPrincipalAttributeException()

            val samlUser = SamlUser(
                username = username,
                prename = firstAttribute(principal, prenameAttribute) ?: "",
                surname = firstAttribute(principal, surnameAttribute) ?: "",
                email = firstAttribute(principal, emailAttribute) ?: ""
            )

            val user = samlLoginService.resolveUser(samlUser)

            val identityPrincipal = toIdentityPrincipal(user)

            val oidcAuthentication =
                UsernamePasswordAuthenticationToken.authenticated(
                    identityPrincipal,
                    null,
                    identityPrincipal.authorities
                )

            val securityContext = SecurityContextHolder.createEmptyContext()

            securityContext.authentication = oidcAuthentication

            SecurityContextHolder.setContext(securityContext)

            securityContextRepository.saveContext(
                securityContext,
                request,
                response
            )

            authenticationSuccessHandler.onAuthenticationSuccess(
                request,
                response,
                oidcAuthentication
            )
        } catch (exception: Exception) {
            log.warn("SAML login post-processing failed: {}", exception.message, exception)

            response.sendRedirect(failurePath)
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

    private fun toIdentityPrincipal(user: User): IdentityUserPrincipal {
        return IdentityUserPrincipal(
            userId = user.id,
            username = user.username,
            password = "",
            globalRole = user.globalRole,
            authorities = listOf(
                SimpleGrantedAuthority("ROLE_${user.globalRole.name}")
            )
        )
    }
}
