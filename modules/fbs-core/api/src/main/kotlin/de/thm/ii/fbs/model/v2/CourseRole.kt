package de.thm.ii.fbs.model.v2

/**
 * The course roles of a user
 */
enum class CourseRole {
    /**
     * Admin of the course.
     */
    DOCENT,

    /**
     * Moderator of the course
     */
    TUTOR,

    /**
     * Participant in the course.
     */
    STUDENT;

    /**
     * Parse an int to a course role.
     * @param roleId The role id
     * @return Course role, where the id is mapped to its assigned enum type, if no enum type
     *         is assigned to the roleId provided, then the STUDENT type is returned.
     */
    fun parse(roleId: Int): CourseRole {
        return when (roleId) {
            0 -> DOCENT
            1 -> TUTOR
            else -> STUDENT
        }
    }
    /**
     * Parse a string to a course role.
     * @param roleName The role name
     * @return Course role, where the name is mapped to its assigned enum type, if no enum type
     *         is assigned to the name provided, then the STUDENT type is returned.
     */
    fun parse(roleName: String): CourseRole {
        return when (roleName) {
            "DOCENT" -> DOCENT
            "TUTOR" -> TUTOR
            else -> STUDENT
        }
    }
}
