package de.thm.ii.fbs.model.classroom

import java.security.Principal

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.classroom.storage.NonDuplicatesBidirectionalStorage
import de.thm.ii.fbs.services.conferences.Conference

import scala.collection.mutable

/**
  * Maps Conferences to principals.
  */
class UserConferenceMap extends NonDuplicatesBidirectionalStorage[Conference, Principal] {
  /**
    * Maps a user to its session
    *
    * @param conference Conference
    * @param p          principal
    */
  def map(conference: Conference, p: Principal): Unit = {
    super.put(conference, p)
    onMapListeners.foreach(_ (conference, p))
  }

  /**
    * @param conference Conference details
    * @return The principal for the given session id
    */
  def get(conference: Conference): Option[Principal] = super.getSingleB(conference)

  /**
    * @param p The principal
    * @return The Conference for the given principal
    */
  def get(p: Principal): Option[Conference] = super.getSingleA(p)

  /**
    * Removes both, the user and its Conference by using its Conference
    *
    * @param conference Session id
    */
  def delete(conference: Conference): Unit = {
    super.deleteByA(conference).foreach(p => {
      onDeleteListeners.foreach(_ (conference, p))
    })
  }

  /**
    * Removes both, the user and its session by using its principal
    *
    * @param p The principal
    */
  def delete(p: Principal): Unit = {
    this.deleteByB(p).foreach(conference => {
      onDeleteListeners.foreach(_ (conference, p))
    })
  }

  private val onMapListeners = mutable.Set[(Conference, Principal) => Unit]()
  private val onDeleteListeners = mutable.Set[(Conference, Principal) => Unit]()

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onMap(cb: (Conference, Principal) => Unit): Unit = {
    onMapListeners.add(cb)
  }

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onDelete(cb: (Conference, Principal) => Unit): Unit = {
    onDeleteListeners.add(cb)
  }

  /**
    * @param user User to check for open Conference for
    * @return boolean state of user existence in this map
    */
  def exists(user: User): Boolean = {
    this.getAllB.exists(p => p.getName == user.username)
  }

  /**
    * Get all user that currently in a course.
    *
    * @param courseId The course id
    * @return The Conferences in the course
    */
  def getConferences(courseId: Int): List[Conference] = this.getAllA.filter(inv => inv.courseId == courseId).toList
}

/**
  * The companion object of UserConferenceMap
  */
object UserConferenceMap extends UserConferenceMap
