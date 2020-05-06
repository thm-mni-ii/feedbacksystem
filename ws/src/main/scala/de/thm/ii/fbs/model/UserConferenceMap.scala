
package de.thm.ii.fbs.model

import java.security.Principal

import scala.collection.mutable

/**
  * Maps session ids to principals.
  *
  * @author Andrej Sajenko
  */
object UserConferenceMap {
  private val conferenceToUser = mutable.Map[Invitation, Principal]()
  private val userToConference = mutable.Map[Principal, Invitation]()

  /**
    * Maps a user to its session
    *
    * @param invitation invitation
    * @param p          principal
    */
  def map(invitation: Invitation, p: Principal): Unit = {
    if (userToConference.contains(p)) {
      conferenceToUser.remove(userToConference(p))
    }
    conferenceToUser.put(invitation, p)
    userToConference.put(p, invitation)
    onMapListeners.foreach(_ (invitation, p))
  }

  /**
    * @param invitation invitation details
    * @return The principal for the given session id
    */
  def get(invitation: Invitation): Option[Principal] = conferenceToUser.get(invitation)

  /**
    * @param p The principal
    * @return The invitation for the given principal
    */
  def get(p: Principal): Option[Invitation] = userToConference.get(p)

  /**
    * Removes both, the user and its invitation by using its invitation
    *
    * @param invitation Session id
    */
  def delete(invitation: Invitation): Unit = {
    conferenceToUser.remove(invitation).foreach(p => {
      userToConference.remove(p)
      onDeleteListeners.foreach(_ (invitation, p))
    })
  }

  /**
    * Removes both, the user and its session by using its principal
    *
    * @param p The principal
    */
  def delete(p: Principal): Unit = {
    userToConference.remove(p).foreach(invitation => {
      conferenceToUser.remove(invitation)
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
    userToConference.exists((p) => p._1.getName == user.username)
  }

  /**
    * Get all user that currently in a course.
    *
    * @param courseId The course id
    * @return The Invitations in the course
    */
  def getInvitations(courseId: Int): List[Invitation] = this.conferenceToUser.filter(inv => courseId == courseId).keys.toList

  /**
    * An Conference System Invitation
    */
    abstract class Invitation {
    /**
    *  @return creator the Creator who published the Invitation
    */
      def creator: User
    /**
      *  @return courseId the scope of the Invitation
      */
      def courseId: Int
    /**
      *  @return courseId the scope of the Invitation
      */
    def service: String

  }
  /**
    * An Conference System Invitation
    *
    * @param meetingId       meetingId for users to generate their own invitation link
    * @param meetingPasswort meetingPassword for users to generate their own invitation link
    * @param creator Issuer for the Invitation
    * @param courseId courseId for the Invitation
    * @param service courseId for the Invitation
    */
  case class BBBInvitation(override val creator: User, override val courseId: Int, override val service: String,
                           meetingId: String, meetingPasswort: String) extends Invitation

  /**
    * An Conference System Invitation
    *
    * @param href    JitsiConference Href for users to join the conference
    * @param creator Issuer for the Invitation
    * @param courseId courseId for the Invitation
    * @param service courseId for the Invitation
    */
  case class JitsiInvitation(override val creator: User, override val courseId: Int,
                             override val service: String, href: String) extends Invitation
}
