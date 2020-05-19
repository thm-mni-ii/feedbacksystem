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
    * Lets a user attend a conference of another user
    * @param invitation invitation of the conference the user want to attend
    * @param principal user that wants to attend
    */
  def attend(invitation: Invitation, principal: Principal): Unit = {
    this.conferenceToUser.get(invitation) match {
      case Some(p) => userToConference.get(p) match {
        case Some(v) => v.attendees += principal.getName;
        case None =>
      }
      case None =>
    }
    onAttendListeners.foreach(_(invitation, principal))
  }

  /**
    * Lets a user depart from a conference of another user
    * Removes both, the user and its invitation by using its invitation
    * @param invitation invitation of the conference the user want to depart from
    * @param principal user that wants to depart
    */
  def depart(invitation: Invitation, principal: Principal): Unit = {
     userToConference.get(invitation.creator) match {
        case Some(v) => {
          v.attendees -= principal.getName
          onDepartListeners.foreach(_(invitation, principal))
        }
        case None =>
    }
  }

  /**
    * Lets a user depart from a conference if he attends any
    * @param principal user that departs from conferences
    */
  def departAll(principal: Principal): Unit = {
    conferenceToUser.keys.foreach((invitation) => {
      if (invitation.attendees.contains(principal.getName)) {
        this.depart(invitation, principal);
      }
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
  private val onAttendListeners = mutable.Set[(Invitation, Principal) => Unit]()
  private val onDepartListeners = mutable.Set[(Invitation, Principal) => Unit]()

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onMap(cb: (Invitation, Principal) => Unit): Unit = {
    onMapListeners.add(cb)
  }

  /**
    * @param cb Callback that gets executed on every attend event
    */
  def onAttend(cb: (Invitation, Principal) => Unit): Unit = {
    onAttendListeners.add(cb)
  }

  /**
    * @param cb Callback that gets executed on every depart event
    */
  def onDepart(cb: (Invitation, Principal) => Unit): Unit = {
    onDepartListeners.add(cb)
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
    * @param creator creator of the invitation
    * @param visibility set of users who attend the conference
    * @param attendees set of users who attend the conference
    * @param service set of users who attend the conference
    * @param courseId set of users who attend the conference
    */
     abstract class Invitation(val creator: User, val courseId: Int, val visibility: String,
                               val attendees: scala.collection.mutable.Set[String], val service: String)
  /**
    * An Conference System Invitation
    *
    * @param meetingId meetingId for users to generate their own invitation link
    * @param meetingPasswort meetingPassword for users to generate their own invitation link
    * @param creator Issuer for the Invitation
    * @param courseId courseId for the Invitation
    * @param service  courseId for the Invitation
    * @param visibility courseId for the Invitation
    * @param attendees courseId for the Invitation
    */
  case class BBBInvitation(override val creator: User, override val courseId: Int, override val visibility: String,
                      override val attendees: scala.collection.mutable.Set[String], override val service: String,
                      meetingId: String, meetingPasswort: String) extends Invitation(creator: User,
    courseId: Int,
    visibility: String,
    attendees: scala.collection.mutable.Set[String],
    service: String
    )

  /**
    * An Conference System Invitation
    *
    * @param href    JitsiConference Href for users to join the conference
    * @param creator Issuer for the Invitation
    * @param courseId courseId for the Invitation
    * @param service courseId for the Invitation
    * @param visibility courseId for the Invitation
    * @param attendees courseId for the Invitation
    * */
  case class JitsiInvitation(override val creator: User, override val courseId: Int, override val visibility: String,
                             override val attendees: scala.collection.mutable.Set[String], override val service: String,
                        href: String) extends Invitation(creator: User,
    courseId: Int,
    visibility: String,
    attendees: scala.collection.mutable.Set[String],
    service: String)
}
