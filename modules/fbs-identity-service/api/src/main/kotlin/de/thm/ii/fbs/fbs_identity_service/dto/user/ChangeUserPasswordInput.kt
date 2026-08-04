package de.thm.ii.fbs.fbs_identity_service.dto.user

data class ChangeUserPasswordInput(
    val userId: Long,
    val newPassword: String,
    val newPasswordRepeat: String
)