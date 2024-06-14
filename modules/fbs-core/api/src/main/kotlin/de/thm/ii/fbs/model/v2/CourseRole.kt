package de.thm.ii.fbs.model.v2

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

    fun parse(role: String): CourseRole {
        return when (role) {
            "DOCENT" -> CourseRole.DOCENT
            "TUTOR" -> CourseRole.TUTOR
            else -> CourseRole.STUDENT
        }
    }
}
