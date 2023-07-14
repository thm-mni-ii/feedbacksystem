package de.thm.ii.fbs.model.v2.security.authorization

import org.springframework.context.annotation.Bean
import org.springframework.security.access.hierarchicalroles.RoleHierarchy
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl

/**
 * The global roles of users
 */
abstract class GlobalRole(val id: Int, val value: String) : Role {
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

        @Bean
        fun roleHierarchy(): RoleHierarchy {
            println("Hierarchy set!")
            val hierarchy = RoleHierarchyImpl()
            hierarchy.setHierarchy("${ADMIN.authority} > ${MODERATOR.authority} \n ${MODERATOR.authority} > ${USER.authority}")
            return hierarchy
        }
    }

    /**
     * Admin manages everything.
     */
    object AdminRole : GlobalRole(0, "ADMIN")

    /**
     * Moderator manages courses, docents and tutors.
     */
    object ModeratorRole : GlobalRole(1, "MODERATOR")

    /**
     * Usual user.
     */
    object UserRole : GlobalRole(2, "USER")

    override fun getAuthority(): String = "ROLE_$value"

    override fun toString(): String {
        return value
    }
}
