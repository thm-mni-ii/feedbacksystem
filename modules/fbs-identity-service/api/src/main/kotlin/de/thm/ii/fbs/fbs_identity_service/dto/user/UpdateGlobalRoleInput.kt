package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import jakarta.validation.constraints.Positive

data class UpdateGlobalRoleInput(
    @field:Positive
    val userId: Long,

    val globalRole: GlobalRole
)
