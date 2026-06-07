package de.thm.ii.fbs.fbs_identity_service.dto

import de.thm.ii.fbs.fbs_identity_service.model.GlobalRole

data class UserFilterInput(
    val query: String?,
    val globalRole: GlobalRole?
)
