package de.thm.ii.fbs.model.classroom

import java.security.Principal

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.classroom.storage.NonDuplicatesBidirectionalStorage

import scala.collection.mutable

/**
  * Maps invitations to principals.
  */
class UserConferenceMap extends NonDuplicatesBidirectionalStorage[Invitation, Principal] {
  /**
    * Maps a user to its session
    *
    * @param invitation invitation
    * @param p          principal
    */
  def map(invitation: Invitation, p: Principal): Unit = {
    super.put(invitation, p)
    onMapListeners.foreach(_ (invitation, p))
  }

  /**
    * @param invitation invitation details
    * @return The principal for the given session id
    */
  def get(invitation: Invitation): Option[Principal] = super.getSingleB(invitation)

  /**
    * @param p The principal
    * @return The invitation for the given principal
    */
  def get(p: Principal): Option[Invitation] = super.getSingleA(p)

  /**
    * Removes both, the user and its invitation by using its invitation
    *
    * @param invitation Session id
    */
  def delete(invitation: Invitation): Unit = {
    super.deleteByA(invitation).foreach(p => {
      onDeleteListeners.foreach(_ (invitation, p))
    })
  }

  /**
    * Removes both, the user and its session by using its principal
    *
    * @param p The principal
    */
  def delete(p: Principal): Unit = {
    this.deleteByB(p).foreach(invitation => {
      onDeleteListeners.foreach(_ (invitation, p))
    })
  }

  private val onMapListeners = mutable.Set[(Invitation, Principal) => Unit]()
  private val onDeleteListeners = mutable.Set[(Invitation, Principal) => Unit]()

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onMap(cb: (Invitation, Principal) => Unit): Unit = {
    onMapListeners.add(cb)
  }

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onDelete(cb: (Invitation, Principal) => Unit): Unit = {
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
    * @return The Invitations in the course
    */
  def getInvitations(courseId: Int): List[Invitation] = this.getAllA.filter(inv => inv.courseId == courseId).toList
}

/**
  * The companion object of UserConferenceMap
  */
object UserConferenceMap extends UserConferenceMap
