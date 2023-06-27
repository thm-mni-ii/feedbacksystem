package de.thm.ii.fbs.model.v2.security

import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import kotlin.jvm.Throws

class LegacyToken(
    val id: Int,
    val username: String,
    val globalRole: GlobalRole
) {
    @Throws(ForbiddenException::class)
    fun hasRole(vararg roles: GlobalRole) {
        if (roles.contains(globalRole)) {
            throw ForbiddenException()
        }
    }

    @Throws(ForbiddenException::class)
    fun hasNotRole(vararg roles: GlobalRole) {
        if (!roles.contains(globalRole)) {
            throw ForbiddenException()
        }
    }
}
