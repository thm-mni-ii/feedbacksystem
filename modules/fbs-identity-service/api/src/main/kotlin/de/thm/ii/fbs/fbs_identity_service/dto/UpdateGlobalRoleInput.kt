package de.thm.ii.fbs.fbs_identity_service.dto

import de.thm.ii.fbs.fbs_identity_service.model.GlobalRole

data class UpdateGlobalRoleInput(
    val userId: Long,
    val globalRole: GlobalRole
)
