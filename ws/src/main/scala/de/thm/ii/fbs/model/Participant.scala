package de.thm.ii.fbs.model

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
case class Participant(user: User, role: CourseRole.Value, visible: Boolean = false) {
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
  override def hashCode(): Int = user.hashCode()

  /**
    * @param other object to check equalness with
    * @return boolean indication equalness
    */
  override def equals(other: Any): Boolean = other match {
    case that: User => user.username.equals(that.username)
    case that: Principal => user.username.equals(that.getName)
    case that: Participant => user.username.equals(that.user.username)
    case _ => false
  }
}
