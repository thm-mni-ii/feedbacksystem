package de.thm.ii.fbs.model.v2.security.authorization

import org.springframework.context.annotation.Bean
import org.springframework.security.access.hierarchicalroles.RoleHierarchy
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl

/**
 * The course roles of a user
 */
abstract class CourseRole(val id: Int, val value: String) : Role {
    companion object { // TODO remove fields in companion object once scala does not access the Roles in patterns
        @JvmField
        val DOCENT = DocentRole

        @JvmField
        val TUTOR = TutorRole

        @JvmField
        val STUDENT = StudentRole

        /**
         * Parse a String to a course role.
         *
         * @param role The role to parse.
         * @return The parsed course role. Defaults to the role student.
         */
        @JvmStatic
        fun parse(role: String): CourseRole = when (role) {
            "DOCENT" -> DOCENT
            "TUTOR" -> TUTOR
            else -> STUDENT
        }

        /**
         * Parse an int to a course role.
         *
         * @param id The role id
         * @return The parsed course role. Defaults to role student.
         */
        @JvmStatic
        fun parse(id: Int): CourseRole = when (id) {
            0 -> DOCENT
            1 -> TUTOR
            else -> STUDENT
        }

        @Bean
        @JvmStatic
        fun roleHierarchy(): RoleHierarchy {
            val hierarchy = RoleHierarchyImpl()
            hierarchy.setHierarchy("${DOCENT.authority} > ${TUTOR.authority} \n ${TUTOR.authority} > ${STUDENT.authority}")
            return hierarchy
        }
    }

    /**
     * Admin of the course.
     */
    object DocentRole : CourseRole(0, "DOCENT")

    /**
     * Moderator of the course
     */
    object TutorRole : CourseRole(1, "TUTOR")

    /**
     * Participant in the course.
     */
    object StudentRole : CourseRole(2, "STUDENT")

    override fun getAuthority(): String = "ROLE_$value"

    override fun toString(): String {
        return value
    }
}
