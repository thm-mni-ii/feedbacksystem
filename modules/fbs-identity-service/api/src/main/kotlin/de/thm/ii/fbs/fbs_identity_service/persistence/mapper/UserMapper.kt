package de.thm.ii.fbs.fbs_identity_service.persistence.mapper

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity

fun UserEntity.toModel(): User {
    return User(
        id = id,
        prename = prename,
        surname = surname,
        email = email ?: "",
        username = username,
        globalRole = GlobalRole.parse(globalRole),
        alias = alias
    )
}