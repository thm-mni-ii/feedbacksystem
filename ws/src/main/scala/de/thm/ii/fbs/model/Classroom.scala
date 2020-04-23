package de.thm.ii.fbs.model

import scala.collection.mutable

/**
  * Handles attendances in classes.
  * @author Andrej Sajenko
  */
object Classroom {
  private val roomsToUsers = mutable.Map[Int, mutable.Set[User]]()
  private val userToRoom = mutable.Map[User, Int]()

  /**
    * Adds a user to a classroom.
    * @param courseId The courseId of a couse
    * @param user The user to add
    */
  def join(courseId: Int, user: User): Unit = {
    roomsToUsers.getOrElseUpdate(courseId, mutable.Set()).add(user)
    userToRoom.put(user, courseId)
  }

  /**
    * Remove user fromm all courses
    * @param user The user to remove
    * @return Course id
    */
  def leave(user: User): Option[Int] = {
    val id = userToRoom.remove(user)
    id.flatMap(roomsToUsers.get)
      .foreach(_.remove(user))
    id
  }

  /**
    * @param u A user
    * @return The course id of the user
    */
  def get(u: User): Option[Int] = userToRoom.get(u)

  /**
    * Get all user that currently in a course.
    * @param courseId The course id
    * @return The user in the course
    */
  def getParticipants(courseId: Int): List[User] = roomsToUsers.getOrElse(courseId, Set()).toList
}
