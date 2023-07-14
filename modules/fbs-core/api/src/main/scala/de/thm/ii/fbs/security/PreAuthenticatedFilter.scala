package de.thm.ii.fbs.security

import de.thm.ii.fbs.controller.exception.UnauthorizedException
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter

import javax.servlet.http.HttpServletRequest

class PreAuthenticatedFilter extends AbstractPreAuthenticatedProcessingFilter {
    @Autowired private val authService: AuthService = null

    override def getPreAuthenticatedPrincipal(request: HttpServletRequest): AnyRef = {
        val res = try {
            authService.authorize(request, null).toUserDetails
        } catch {
            case _: UnauthorizedException => null
        }
        res
    }

    override def getPreAuthenticatedCredentials(request: HttpServletRequest): AnyRef = {
        request.getHeader("Authorization")
    }
}
