package de.thm.ii.fbs.fbs_identity_service.dto.user

import jakarta.validation.constraints.NotBlank

data class ChangeOwnPasswordInput(
    @field:NotBlank
    val currentPassword: String,

    @field:NotBlank
    val newPassword: String,

    @field:NotBlank
    val newPasswordRepeat: String
)