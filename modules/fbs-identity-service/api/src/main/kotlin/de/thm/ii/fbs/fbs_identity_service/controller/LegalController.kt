package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.legal.LegalTextResponse
import de.thm.ii.fbs.fbs_identity_service.dto.legal.TermsOfUseAcceptanceResponse
import de.thm.ii.fbs.fbs_identity_service.exception.dto.ErrorResponse
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.auth.CurrentUserService
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.core.io.ClassPathResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@Tag(name = "Legal", description = "Legal text and terms-of-use endpoints")
@RestController
@RequestMapping("/api/v1/legal")
class LegalController(private val userService: UserService, private val currentUserService: CurrentUserService) {

    @Operation(
        summary = "Get legal text",
        description = "Returns a legal text file such as imprint or privacy policy."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200"),
        ApiResponse(responseCode = "404", description = "Legal text file not found", content = [
            Content(
                schema = Schema(implementation = ErrorResponse::class)
            )
        ])
    )
    @GetMapping("/{filename}", produces = [APPLICATION_JSON_VALUE])
    fun legalTexts(@PathVariable filename: String): LegalTextResponse {
        val resourceName = when (filename) {
            "impressum" -> "impressum.md"
            "privacy-text" -> "privacy_text.md"
            else -> throw ResponseStatusException(HttpStatus.NOT_FOUND, "Legal text file not found")
        }

        val text = ClassPathResource(resourceName)
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        return LegalTextResponse(text)
    }

    @Operation(
        summary = "Get terms of use acceptance status",
        description = "Returns whether the current user has accepted the terms of use."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200"),
        ApiResponse(responseCode = "401", description = "User is not authenticated", content = [
            Content(
                schema = Schema(implementation = ErrorResponse::class)
            )
        ]
        )
    )
    @GetMapping("/termsofuse/status", produces = [APPLICATION_JSON_VALUE])
    fun getTermsOfUseAcceptanceStatus(): TermsOfUseAcceptanceResponse {
        val user = currentUserService.getCurrentUser()
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated")

        return TermsOfUseAcceptanceResponse(
            accepted = userService.getPrivacyStatusOf(user.id)
        )
    }

    @Operation(
        summary = "Accept terms of use",
        description = "Marks the terms of use as accepted for the current user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "204"),
        ApiResponse(responseCode = "401", description = "User is not authenticated", content = [
            Content(
                mediaType = APPLICATION_JSON_VALUE,
                schema = Schema(implementation = ErrorResponse::class)
            )
        ]
        )
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PutMapping("/termsofuse/accept")
    fun acceptTermsOfUse() {
        val user = currentUserService.getCurrentUser()
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated")

        userService.updateAgreementToPrivacyFor(user.id, true)
    }
}
