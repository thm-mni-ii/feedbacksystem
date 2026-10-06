package de.thm.ii.fbs.fbs_identity_service.dto.auth

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

@Schema(description = "Request body to exchange the current user token for a target audience-scoped token")
data class TokenExchangeRequest(
    @field:NotBlank(message = "targetAudience must not be blank")
    @param:Schema(description = "Identifier or clientId of the target application provider", example = "course-management")
    val targetAudience: String
)
