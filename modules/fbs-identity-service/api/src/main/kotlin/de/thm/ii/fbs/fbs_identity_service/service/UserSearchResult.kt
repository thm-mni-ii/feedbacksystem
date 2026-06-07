package de.thm.ii.fbs.fbs_identity_service.service

import de.thm.ii.fbs.fbs_identity_service.model.User

data class UserSearchResult(
    val items: List<User>,
    val totalCount: Int
)
