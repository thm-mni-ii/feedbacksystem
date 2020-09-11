package de.thm.ii.fbs.model.practiceroom

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.practiceroom.storage.BidirectionalStorage

import scala.collection.mutable

/**
  * Handles attendances in classes.
  *
  * @author Andrej Sajenko
  */
object Classroom extends BidirectionalStorage[Int, User] {
  private val roomsToUsers = mutable.Map[Int, mutable.Set[User]]()
  private val userToRoom = mutable.Map[User, Int]()

  /**
    * Adds a user to a classroom.
    *
    * @param courseId The courseId of a couse
    * @param user     The user to add
    */
  def join(courseId: Int, user: User): Unit = super.put(courseId, user)

  /**
    * Remove user fromm all courses
    *
    * @param user The user to remove
    * @return Course id
    */
  def leave(user: User): Option[Int] = super.deleteByB(user).headOption

  /**
    * @param u A user
    * @return The course id of the user
    */
  def get(u: User): Option[Int] = super.getA(u).headOption

  /**
    * Get all user that currently in a course.
    *
    * @param courseId The course id
    * @return The user in the course
    */
  def getParticipants(courseId: Int): List[User] = super.getB(courseId).toList
}
