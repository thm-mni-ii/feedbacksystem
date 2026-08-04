package de.thm.ii.fbs.fbs_identity_service.dto.user

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive

data class ChangeUserPasswordInput(
    @field:Positive
    val userId: Long,

    @field:NotBlank
    val newPassword: String,

    @field:NotBlank
    val newPasswordRepeat: String
)