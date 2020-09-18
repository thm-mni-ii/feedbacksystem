package de.thm.ii.fbs.model.classroom

import java.util.Objects

import de.thm.ii.fbs.model.User

/**
  * An issue ticket
  *
  * @param courseId The course id
  * @param title Title of a ticket
  * @param desc The message
  * @param status The ticket status
  * @param creator The user who created the ticket
  * @param assignee The user to that the ticket is assigned to
  * @param timestamp The timestamp of the creation
  * @param priority The priority of the issue ticket
  * @param id the unique ticket id
  * @param queuePosition the unique ticket id
  */
case class Ticket(courseId: Int, title: String, desc: String, status: String, creator: User,
                  assignee: User, timestamp: Long, priority: Int, id: String = "0", var queuePosition: Int = 0) {
  /**
    * @return The hash code -- using id
    */
  override def hashCode(): Int = Objects.hash(id)

  /**
    * @param other The other object
    * @return True if id is the same
    */
  override def equals(other: Any): Boolean = other match {
    case that: Ticket => that.canEqual(this) && this.id == that.id
    case _ => false
  }
}
