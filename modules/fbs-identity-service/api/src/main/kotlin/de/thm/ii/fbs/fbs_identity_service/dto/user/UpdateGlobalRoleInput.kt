package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole

data class UpdateGlobalRoleInput(
    val userId: Long,
    val globalRole: GlobalRole
)