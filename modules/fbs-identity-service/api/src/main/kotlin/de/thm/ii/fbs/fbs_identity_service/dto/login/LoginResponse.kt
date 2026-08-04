package de.thm.ii.fbs.fbs_identity_service.dto.login

data class LoginResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long
)
