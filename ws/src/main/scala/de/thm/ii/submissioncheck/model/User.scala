package de.thm.ii.submissioncheck.model

import java.util
import scala.collection.JavaConverters._

/**
  * Class User holds all data from the user table
  *
  * @author Benjamin Manns
  * @param userid local DB's userid
  * @param username User's username
  * @param role User's role name
  */
class User(val userid: Int, val username: String, val role: String) {
  /**
    * Return User as JavaMap. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Java Map / JSON of User Data
    */
  def asJavaMap(): util.Map[String, String] = {
    Map("userid" -> this.userid.toString, "username" -> this.username, "role" -> this.role).asJava
  }
}
