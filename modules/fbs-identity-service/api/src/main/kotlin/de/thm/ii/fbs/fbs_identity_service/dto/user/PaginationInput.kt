package de.thm.ii.fbs.fbs_identity_service.dto.user

data class PaginationInput(
    val limit: Int,
    val offset: Int?
)