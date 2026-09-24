package de.thm.ii.fbs.fbs_identity_service.persistence.mapper

import de.thm.ii.fbs.fbs_identity_service.model.user.AuthSource
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity

fun UserEntity.toModel(): User {
    val internal = !password.isNullOrBlank()
    val calculatedDisplayName = when {
        !alias.isNullOrBlank() -> alias!!.trim()
        "$prename $surname".trim().isNotEmpty() -> "$prename $surname".trim()
        else -> username
    }

    return User(
        id = id,
        prename = prename,
        surname = surname,
        email = email ?: "",
        username = username,
        globalRole = GlobalRole.parse(globalRole),
        alias = alias,
        source = if (internal) AuthSource.INTERNAL else AuthSource.SAML,
        hasPassword = internal,
        displayName = calculatedDisplayName
    )
}
