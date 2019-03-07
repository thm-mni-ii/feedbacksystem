package de.thm.ii.submissioncheck.model

import de.thm.ii.submissioncheck.services.UserDBLabels

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
  */
class User(val userid: Int, val username: String, val prename: String, val surname: String, val email: String, val role: String,
           val roleid: Int, val privacy_checked: Boolean = false) {
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
