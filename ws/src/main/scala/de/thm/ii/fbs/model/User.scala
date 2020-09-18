package de.thm.ii.fbs.model

import java.security.Principal

import de.thm.ii.fbs.services.labels.{RoleDBLabels, UserDBLabels}

/**
  * Class User holds all data from the user table
  *
  * @author Benjamin Manns
  * @param userid local DB's userid
  * @param username User's username
  * @param prename User's prename
  * @param surname User's surname
  * @param email User's email
  * @param role User's role name
  * @param roleid User's role id
  * @param privacy_checked did user accept the policy
  * @param password the DB password hash
  */
class User(val userid: Int, val username: String, val prename: String, val surname: String, val email: String, val role: String,
           val roleid: Int, val privacy_checked: Boolean = false, val password: String = null) extends Principal {
  /**
    * Return User as Map. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Map / JSON of User Data
    */
  def asMap(): Map[String, Any] = {
    Map(UserDBLabels.user_id -> this.userid, UserDBLabels.username -> this.username, "role" -> this.role,
      UserDBLabels.role_id -> this.roleid, UserDBLabels.prename -> this.prename, UserDBLabels.surname -> this.surname, UserDBLabels.email -> email,
      UserDBLabels.privacy_checked -> this.privacy_checked)
  }

  /**
    * @return The username of the user
    */
  def getName(): String = username

  /**
    * Print User infomation
    * @return user info string
    */
  override def toString: String = {
    asMap().toString()
  }

  /**
    * @return True if user has admin role
    */
  def isAdmin: Boolean = userid == 1
  /**
    * @return True if user has moderator role
    */
  def isModerator: Boolean = userid == 2
  /**
    * @return True if user has docent role in any course
    */
  def isDocent: Boolean = userid == 4
  /**
    * @return True if user has tutor role in any course
    */
  def isTutor: Boolean = userid == 8

  /**
    * Checks if the user has at least the provided role, i.e., the user role may admit more rights than the one provided
    * @param role The provided role
    * @return True if the condition above is met.
    */
  def isAtLeastInRole(role: Role.Value): Boolean = this.roleid <= role.id

  /**
    * Checks if the user has at most the provided role, i.e., the user role may admit more rights than the one provided
    * @param role The provided role
    * @return True if the condition above is met.
    */
  def isAtMostInRole(role: Role.Value): Boolean = this.roleid >= role.id

  private def canEqual(other: Any): Boolean = other.isInstanceOf[User]

  /**
    * Compares objects instances: two users are equal if they have the same username
    * @param other Other user
    * @return true, if they have the same username.
    */
  override def equals(other: Any): Boolean = other match {
    case that: User =>
      (that canEqual this) &&
        username == that.username
    case _ => false
  }

  /**
    * @return Hashcode of a user object
    */
  override def hashCode(): Int = {
    val state = Seq(username)
    state.map(_.hashCode()).foldLeft(0)((a, b) => 31 * a + b)
  }
}

/**
  * a simple User for the System
  *
  * @param userid local DB's userid
  * @param username User's username
  * @param prename User's prename
  * @param surname User's surname
  * @param email User's email
  * @param role User's role name
  * @param roleid User's role id
  * @param privacy_checked did user accept the policy
  */
class SimpleUser(override val userid: Int = -1, override val username: String = "", override val prename: String = "",
                 override val surname: String = "",
                 override val email: String = "", override val role: String = RoleDBLabels.STUDENT,
                 override val roleid: Int = RoleDBLabels.USER_ROLE_ID, override val privacy_checked: Boolean = false) extends
                User(userid, username, prename, surname, email, role, roleid, privacy_checked)

/**
  * the admin User for the System
  *
  * @param userid local DB's userid
  * @param username User's username
  * @param prename User's prename
  * @param surname User's surname
  * @param email User's email
  * @param role User's role name
  * @param roleid User's role id
  * @param privacy_checked did user accept the policy
  */
class AdminUser(override val userid: Int = 1, override val username: String = "admin", override val prename: String = "admin",
                 override val surname: String = "",
                 override val email: String = "", override val role: String = RoleDBLabels.ADMIN,
                 override val roleid: Int = RoleDBLabels.ADMIN_ROLE_ID, override val privacy_checked: Boolean = false) extends
  User(userid, username, prename, surname, email, role, roleid, privacy_checked)

/**
  * The roles of a user.
  */
object Role extends Enumeration {
  /**
    * Admin manages everything.
    */
  val ADMIN = Value(1)
  /**
    * Moderator manages courses, docents and tutors.
    */
  val MODERATOR = Value(2)
  /**
    * Docent manages his own courses and his own tutors.
    */
  val DOCENT = Value(4)
  /**
    * Manages a course where he is a tutor.
    */
  val TUTOR = Value(8)
  /**
    * Usual user.
    */
  val USER = Value(16)
}
