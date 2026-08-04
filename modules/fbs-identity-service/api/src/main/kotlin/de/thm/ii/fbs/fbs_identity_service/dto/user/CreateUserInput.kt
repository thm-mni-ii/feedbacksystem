package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.GlobalRole

data class CreateUserInput(
    val prename: String,
    val surname: String,
    val email: String,
    val username: String,
    val password: String,
    val globalRole: GlobalRole?,
    val alias: String?
)