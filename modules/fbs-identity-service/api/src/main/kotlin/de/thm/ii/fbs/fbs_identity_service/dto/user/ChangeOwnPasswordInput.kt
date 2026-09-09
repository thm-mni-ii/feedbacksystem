package de.thm.ii.fbs.fbs_identity_service.dto.user

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChangeOwnPasswordInput(
    @field:NotBlank
    val currentPassword: String,

    @field:NotBlank
    @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters long")
    val newPassword: String,

    @field:NotBlank
    @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters long")
    val newPasswordRepeat: String
)
