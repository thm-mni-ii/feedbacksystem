package de.thm.ii.submissioncheck.model

/**
  * Class User holds all data from the user table
  *
  * @author Benjamin Manns
  * @param userid local DB's userid
  * @param username User's username
  * @param role User's role name
  * @param roleid User's role id
  */
class User(val userid: Int, val username: String, val role: String, val roleid: Int) {
  /**
    * Return User as Map. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Map / JSON of User Data
    */
  def asMap(): Map[String, Any] = {
    Map("userid" -> this.userid.toString, "username" -> this.username, "role" -> this.role, "roleid" -> this.roleid)
  }

  /**
    * Print User infomation
    * @return user info string
    */
  override def toString: String = {
    asMap().toString()
  }
}
