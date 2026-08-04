package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginRequest
import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.service.auth.LocalLoginService
import de.thm.ii.fbs.fbs_identity_service.exception.dto.ErrorResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Authentication", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController (private val localLoginService: LocalLoginService) {

    @Operation(
        summary = "Local login",
        description = "Authenticates a user with username and password and returns a JWT."
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200"),
            ApiResponse(responseCode = "400", description = "Invalid request body", content = [
                Content(schema = Schema(implementation = ErrorResponse::class)
                )
            ]),
            ApiResponse(responseCode = "401", description = "Invalid username or password", content = [
                Content(
                    schema = Schema(implementation = ErrorResponse::class)
                )
            ])
        ]
    )
    @PostMapping("/login", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun login(@Valid @RequestBody request: LoginRequest): LoginResponse {
        return localLoginService.login(request.username, request.password)
    }

}
