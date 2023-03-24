package de.thm.ii.fbs.model.v2

import de.thm.ii.fbs.model.v2.security.User

data class Participant(val user: User, val role: CourseRole, val visible: Boolean = true)
