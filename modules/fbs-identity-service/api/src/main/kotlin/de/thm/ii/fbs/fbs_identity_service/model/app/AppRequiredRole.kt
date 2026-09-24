package de.thm.ii.fbs.fbs_identity_service.model.app

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole

enum class AppRequiredRole {
    ALL,
    USER,
    MODERATOR,
    ADMIN;

    fun isAccessibleBy(userRole: GlobalRole?): Boolean {
        return when (this) {
            ALL -> true
            USER -> userRole != null
            MODERATOR -> userRole == GlobalRole.MODERATOR || userRole == GlobalRole.ADMIN
            ADMIN -> userRole == GlobalRole.ADMIN
        }
    }
}
