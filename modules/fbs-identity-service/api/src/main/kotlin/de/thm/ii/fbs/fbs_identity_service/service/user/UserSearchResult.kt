package de.thm.ii.fbs.fbs_identity_service.service.user

import de.thm.ii.fbs.fbs_identity_service.model.user.User

data class UserSearchResult(
    val items: List<User>,
    val totalCount: Int
)