package de.thm.ii.fbs.model.v2.course

import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.CourseRole

class Participant(val user: User, val role: CourseRole, val visible: Boolean = true) {

    override fun hashCode(): Int = user.hashCode()

    override fun equals(other: Any?): Boolean = user == other
}
