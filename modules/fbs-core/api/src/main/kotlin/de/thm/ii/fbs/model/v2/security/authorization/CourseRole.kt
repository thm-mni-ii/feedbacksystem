package de.thm.ii.fbs.model.v2.security.authorization

/**
 * The course roles of a user
 */
abstract class CourseRole(val id: Int) /*: Role*/ { // FIXME course roles are not application-wide permissions instead use the project’s domain object security capabilities.
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
    }

    /**
     * Admin of the course.
     */
    object DocentRole : CourseRole(0) {
        /*override*/ fun getAuthority(): String = "ROLE_DOCENT"
    }

    /**
     * Moderator of the course
     */
    object TutorRole : CourseRole(0) {
        /*override*/ fun getAuthority(): String = "ROLE_TUTOR"
    }

    /**
     * Participant in the course.
     */
    object StudentRole : CourseRole(0) {
        /*override*/ fun getAuthority(): String = "ROLE_STUDENT"
    }
}
