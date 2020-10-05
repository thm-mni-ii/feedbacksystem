package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.{Participant}
import de.thm.ii.fbs.model.classroom.storage.BidirectionalStorage

/**
  * Handles attendances in classes.
  *
  * @author Andrej Sajenko
  */
class Classroom extends BidirectionalStorage[Int, Participant] {
  /**
    * Adds a user to a classroom.
    *
    * @param courseId The courseId of a couse
    * @param user     The user to add
    */
  def join(courseId: Int, user: Participant): Unit = super.put(courseId, user)

  /**
    * Remove user fromm all courses
    *
    * @param user The user to remove
    * @return Course id
    */
  def leave(user: Participant): Option[Int] = super.deleteByB(user).headOption

  /**
    * @param u A user
    * @return The course id of the user
    */
  def get(u: Participant): Option[Int] = super.getA(u).headOption

  /**
    * Get all user that currently in a course.
    *
    * @param courseId The course id
    * @return The user in the course
    */
  def getParticipants(courseId: Int): List[Participant] = super.getB(courseId).toList
}

/**
  * The companion object of Classroom
  */
object Classroom extends Classroom
