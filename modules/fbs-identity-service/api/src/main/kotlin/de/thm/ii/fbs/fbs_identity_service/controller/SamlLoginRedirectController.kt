package de.thm.ii.fbs.fbs_identity_service.controller

import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/login")
class SamlLoginRedirectController(
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean,

    @param:Value("\${app.saml.registration-id:adfs}")
    private val registrationId: String
) {

    @GetMapping("/sso")
    fun sso(response: HttpServletResponse) {
        if (!samlEnabled) {
            throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SAML is not enabled")
        }

        response.sendRedirect("/saml2/authenticate/$registrationId")
    }
}