package de.thm.ii.fbs.fbs_identity_service.dto

import de.thm.ii.fbs.fbs_identity_service.model.User

data class UserPage(
    val items: List<User>,
    val totalCount: Int
)
