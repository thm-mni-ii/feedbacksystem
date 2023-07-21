package de.thm.ii.fbs.model.v2

import java.security.Principal

import org.json.JSONObject

/**
 * Course participant
 *
 * @param user The participant
 * @param role The participants role in the course
 * @param visible visibility state
 * @author Andrej Sajenko
 */
data class Participant(val user: User, val role: CourseRole, val visible: Boolean = true) {
    /**
     * visibility state of User in Conference component
     */
    var isVisible: Boolean = visible

    /**
     * Calls underlying users toJson function
     * @return user toJson
     */
    val toJson: JSONObject = user.toJson().put("courseRole", role)

    /**
     * @return user hashcode
     */
    override fun hashCode(): Int {
        return user.hashCode()
    }

    /**
     * @param other object to check equalness with
     * @return boolean indication equalness
     */
    fun equals(other: Any): Boolean {
        return when(other) {
            is User -> user . username == other.username
            is Principal -> user . username == other.name
            is Participant -> user . username == other.user.username
            else -> false
        }
    }
}
