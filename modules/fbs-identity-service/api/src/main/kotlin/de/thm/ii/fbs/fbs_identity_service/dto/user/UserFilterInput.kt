package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import jakarta.validation.constraints.Size

data class UserFilterInput(
    @field:Size(max = 200)
    val query: String?,

    val globalRole: GlobalRole?
)
