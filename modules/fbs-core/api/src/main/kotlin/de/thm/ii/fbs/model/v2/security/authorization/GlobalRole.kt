package de.thm.ii.fbs.model.v2.security.authorization

/**
 * The global roles of users
 */
abstract class GlobalRole(val id: Int) : Role {
    companion object { // TODO remove and use objects instead of subclasses once scala does not access the Roles in patterns
        @JvmField val ADMIN = Admin()

        @JvmField val MODERATOR = Moderator()

        @JvmField val USER = User()

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
    class Admin : GlobalRole(0) {
        override fun getAuthority(): String = "ROLE_ADMIN"
    }

    /**
     * Moderator manages courses, docents and tutors.
     */
    class Moderator : GlobalRole(1) {
        override fun getAuthority(): String = "ROLE_MODERATOR"
    }

    /**
     * Usual user.
     */
    class User : GlobalRole(2) {
        override fun getAuthority(): String = "ROLE_USER"
    }
}
