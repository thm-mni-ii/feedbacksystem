package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.user.User

data class UserPage(
    val items: List<User>,
    val totalCount: Int
)
