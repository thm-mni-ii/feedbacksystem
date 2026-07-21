package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginRequest
import de.thm.ii.fbs.fbs_identity_service.security.local.OidcLocalLoginService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class OidcLoginController(
    private val oidcLocalLoginService: OidcLocalLoginService,
    private val securityContextRepository: SecurityContextRepository
) {

    private val authenticationSuccessHandler =
        SavedRequestAwareAuthenticationSuccessHandler()

    @PostMapping("/oidc-login")
    fun oidcLogin(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest,
        httpResponse: HttpServletResponse
    ) {
        val authentication = oidcLocalLoginService.authenticate(
            request.username,
            request.password
        )

        val securityContext = SecurityContextHolder.createEmptyContext()
        securityContext.authentication = authentication

        SecurityContextHolder.setContext(securityContext)

        securityContextRepository.saveContext(
            securityContext,
            httpRequest,
            httpResponse
        )

        authenticationSuccessHandler.onAuthenticationSuccess(
            httpRequest,
            httpResponse,
            authentication
        )
    }
}