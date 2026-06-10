package de.thm.ii.fbs.fbs_identity_service.dto.user

data class ChangeOwnPasswordInput(
    val currentPassword: String,
    val newPassword: String,
    val newPasswordRepeat: String
)