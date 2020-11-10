package de.thm.ii.fbs.model

import org.json.JSONObject

/**
  * Course participant
 *
  * @param user The participant
  * @param role The participants role in the course
  * @param visible visibility state
  * @author Andrej Sajenko
  */
case class Participant(user: User, role: CourseRole.Value, visible: Boolean = true) {
  /**
    * visibility state of User in Conference component
    */
  var isVisible: Boolean = visible
  /**
    * Calls underlying users toJson function
    * @return user toJson
    */
  val toJson: JSONObject = user.toJson().put("courseRole", role)
}
