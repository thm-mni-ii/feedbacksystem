package de.thm.ii.fbs.fbs_identity_service.dto.user

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.PositiveOrZero

data class PaginationInput(
    @field:Min(1)
    @field:Max(100)
    val limit: Int,

    @field:PositiveOrZero
    val offset: Int?
)