package de.thm.ii.fbs.fbs_identity_service.model.user

data class User(
    val id: Long,
    val prename: String,
    val surname: String,
    val email: String,
    val username: String,
    var globalRole: GlobalRole,
    val alias: String? = null
)
