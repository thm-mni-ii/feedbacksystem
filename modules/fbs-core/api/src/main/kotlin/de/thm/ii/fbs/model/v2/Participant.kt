package de.thm.ii.fbs.model.v2

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.model.v2.security.User

data class Participant(@JsonProperty val user: User, @JsonProperty val role: CourseRole, @JsonProperty val visible: Boolean = true)
