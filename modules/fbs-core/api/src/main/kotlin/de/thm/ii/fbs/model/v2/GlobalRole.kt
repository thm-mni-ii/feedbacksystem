package de.thm.ii.fbs.model.v2

enum class GlobalRole {

    /**
     * Admin manages everything.
     */
    ADMIN,

    /**
     * Moderator manages courses, docents and tutors.
     */
    MODERATOR,

    /**
     * Usual user.
     */
    USER;
    companion object {
        fun parse(role: String): GlobalRole {
            return when (role) {
                "ADMIN" -> GlobalRole.ADMIN
                "MODERATOR" -> GlobalRole.MODERATOR
                else -> GlobalRole.USER
            }
        }
    }
}