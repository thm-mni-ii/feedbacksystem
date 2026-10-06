package de.thm.ii.fbs.fbs_identity_service.dto.auth

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response containing the audience-scoped access token")
data class TokenExchangeResponse(
    @param:Schema(description = "Signed RS256 JWT access token for the target audience")
    val accessToken: String,

    @param:Schema(description = "Token type", example = "Bearer")
    val tokenType: String = "Bearer",

    @param:Schema(description = "Token validity duration in seconds", example = "600")
    val expiresIn: Long,

    @param:Schema(description = "Target audience claim of the token", example = "course-management")
    val audience: String
)
