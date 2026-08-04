package de.thm.ii.fbs.fbs_identity_service.model

enum class GlobalRole(val id: Int) {
    ADMIN(0),
    MODERATOR(1),
    USER(2);

    companion object {
        fun parse(roleId: Int): GlobalRole {
            return when (roleId) {
                0 -> ADMIN
                1 -> MODERATOR
                else -> USER
            }
        }

        fun parse(roleName: String): GlobalRole {
            return when (roleName) {
                "ADMIN" -> ADMIN
                "MODERATOR" -> MODERATOR
                else -> USER
            }
        }
    }
}