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
import de.thm.ii.fbs.fbs_identity_service.security.ratelimit.ClientIpResolver
import de.thm.ii.fbs.fbs_identity_service.security.ratelimit.LoginAttemptService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@Tag(name = "Authentication", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/auth")
class OidcLocalLoginController(
    private val oidcLocalLoginService: OidcLocalLoginService,
    private val securityContextRepository: SecurityContextRepository,
    private val loginAttemptService: LoginAttemptService,
    private val clientIpResolver: ClientIpResolver
) {

    private val authenticationSuccessHandler = SavedRequestAwareAuthenticationSuccessHandler()

    private val logger = LoggerFactory.getLogger(OidcLocalLoginController::class.java)

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
            ),
            ApiResponse(
                responseCode = "429",
                description = "Too many failed login attempts",
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
        val clientIp = clientIpResolver.resolve(httpRequest)

        if (clientIp == null) {
            logger.warn("Blocked local login attempt: Failed to determine client IP")

            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Failed to determine client IP"
            )
        }

        if (loginAttemptService.isBlocked(clientIp, request.username)) {
            logger.warn("Blocked local login attempt from IP {}: rate limit exceeded", clientIp)

            throw ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Too many failed login attempts"
            )
        }

        val authentication = try {
            oidcLocalLoginService.authenticate(
                request.username,
                request.password
            )
        } catch (exception: BadCredentialsException) {
            loginAttemptService.recordFailure(
                clientIp,
                request.username
            )

            throw exception
        }

        loginAttemptService.recordSuccess(request.username)

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
