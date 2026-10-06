package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeRequest
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeResponse
import de.thm.ii.fbs.fbs_identity_service.exception.dto.ErrorResponse
import de.thm.ii.fbs.fbs_identity_service.service.auth.TokenExchangeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Authentication", description = "Authentication & Token Exchange Endpoints")
@RestController
@RequestMapping("/api/v1/auth")
class TokenExchangeController(
    private val tokenExchangeService: TokenExchangeService
) {

    @Operation(
        summary = "Exchange current user token for target application audience token",
        description = "Mints an RS256 JWT access token scoped specifically with the requested audience claim for an embedded or target application provider."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully exchanged token",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = TokenExchangeResponse::class)
                    )
                ]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request payload",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "User is not authenticated",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            ),
            ApiResponse(
                responseCode = "403",
                description = "User role not authorized for requested target audience",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Target audience not found",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class)
                    )
                ]
            )
        ]
    )
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/token/exchange", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun exchangeToken(
        @Valid @RequestBody request: TokenExchangeRequest
    ): TokenExchangeResponse {
        return tokenExchangeService.exchangeToken(request)
    }
}
