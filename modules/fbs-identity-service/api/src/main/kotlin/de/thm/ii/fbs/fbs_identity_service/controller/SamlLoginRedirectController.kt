package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlRouteService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.util.UriComponentsBuilder

@Tag(name = "Authentication", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/login")
class SamlLoginRedirectController(
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean,

    @param:Value("\${app.saml.registration-id:adfs}")
    private val registrationId: String,

    private val samlRouteService: SamlRouteService
) {

    @Operation(
        summary = "Start SAML redirect",
        description = "Redirects the user to the configured SAML authentication endpoint."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "302",
                description = "Redirect to SAML authentication"
            ),
            ApiResponse(
                responseCode = "503",
                description = "SAML is not enabled"
            )
        ]
    )
    @GetMapping("/sso")
    fun sso(@RequestParam(value = "route", required = false) route: String?, response: HttpServletResponse) {
        if (!samlEnabled) {
            throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SAML is not enabled")
        }

        val redirectBuilder = UriComponentsBuilder
            .fromPath("/saml2/authenticate/{registrationId}")

        samlRouteService.sanitize(route)?.let {
            redirectBuilder.queryParam("route", it)
        }

        val redirectUrl = redirectBuilder
            .buildAndExpand(registrationId)
            .encode()
            .toUriString()

        response.sendRedirect(redirectUrl)
    }
}
