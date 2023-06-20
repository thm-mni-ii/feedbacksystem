package de.thm.ii.fbs.model.v2.security.authorization

/**
 * The global roles of users
 */
abstract class GlobalRole(val id: Int) : Role {
    companion object { // TODO remove fields in companion object once scala does not access the Roles in patterns
        @JvmField
        val ADMIN = AdminRole

        @JvmField
        val MODERATOR = ModeratorRole

        @JvmField
        val USER = UserRole

        /**
         * Parse a String to a global role.
         *
         * @param role The role to parse.
         * @return The parsed global role. Defaults to the role user.
         */
        @JvmStatic
        fun parse(role: String): GlobalRole = when (role) {
            "ADMIN" -> ADMIN
            "MODERATOR" -> MODERATOR
            else -> USER
        }

        /**
         * Parse an int to a global role.
         *
         * @param id The role id
         * @return The parsed global role. Defaults to role user.
         */
        @JvmStatic
        fun parse(id: Int): GlobalRole = when (id) {
            0 -> ADMIN
            1 -> MODERATOR
            else -> USER
        }
    }

    /**
     * Admin manages everything.
     */
    object AdminRole : GlobalRole(0) {
        override fun getAuthority(): String = "ROLE_ADMIN"
    }

    /**
     * Moderator manages courses, docents and tutors.
     */
    object ModeratorRole : GlobalRole(1) {
        override fun getAuthority(): String = "ROLE_MODERATOR"
    }

    /**
     * Usual user.
     */
    object UserRole : GlobalRole(2) {
        override fun getAuthority(): String = "ROLE_USER"
    }
}
