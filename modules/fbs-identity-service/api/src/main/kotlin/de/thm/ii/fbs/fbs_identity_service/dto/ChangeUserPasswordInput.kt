package de.thm.ii.fbs.fbs_identity_service.dto

data class ChangeUserPasswordInput(
    val userId: Long,
    val newPassword: String,
    val newPasswordRepeat: String
)
