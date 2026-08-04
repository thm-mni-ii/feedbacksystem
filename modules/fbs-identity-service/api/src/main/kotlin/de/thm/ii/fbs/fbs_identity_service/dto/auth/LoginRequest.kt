package de.thm.ii.fbs.fbs_identity_service.dto.auth
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:NotBlank
    @field:Size(max = 200)
    val username: String,

    @field:NotBlank
    val password: String
)
