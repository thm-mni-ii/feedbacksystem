package de.thm.ii.fbs.model

import de.thm.ii.fbs.services.{RoleDBLabels, UserDBLabels}

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
           val roleid: Int, val privacy_checked: Boolean = false, val password: String = null) {
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
    * Print User infomation
    * @return user info string
    */
  override def toString: String = {
    asMap().toString()
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
