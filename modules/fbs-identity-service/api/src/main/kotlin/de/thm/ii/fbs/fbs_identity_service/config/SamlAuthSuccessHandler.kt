package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlLoginService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component

@Component
class SamlAuthSuccessHandler(
    private val samlLoginService: SamlLoginService
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        // TODO:
        // 1. Authentication als Saml2Authentication behandeln
        // 2. NameID / Attribute auslesen
        // 3. SamlUser bauen
        // 4. samlLoginService.login(samlUser)
        // 5. JWT als Cookie setzen oder Redirect-Strategie festlegen
    }


}