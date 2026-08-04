package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.auth.LoginRequest
import de.thm.ii.fbs.fbs_identity_service.security.local.OidcLocalLoginService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import io.swagger.v3.oas.annotations.media.Schema
import de.thm.ii.fbs.fbs_identity_service.exception.dto.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Authentication", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/auth")
class OidcLocalLoginController(
    private val oidcLocalLoginService: OidcLocalLoginService,
    private val securityContextRepository: SecurityContextRepository
) {

    private val authenticationSuccessHandler =
        SavedRequestAwareAuthenticationSuccessHandler()

    @Operation(
        summary = "OIDC local login",
        description = "Authenticates a local database user during an active OIDC authorization flow and continues the previously saved authorization request."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "302",
                description = "Authentication successful; redirects to the saved authorization request",
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request body",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Invalid username or password",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            )
        ]
    )
    @PostMapping("/oidc-login", consumes = [MediaType.APPLICATION_JSON_VALUE])
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
