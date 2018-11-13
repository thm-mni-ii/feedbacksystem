package de.thm.ii.submissioncheck.model

import java.util
import scala.collection.JavaConverters._

/**
  * Class User holds all data from the user table
  *
  * @author Benjamin Manns
  * @param id local DB's userid
  * @param name User's username
  * @param role_name User's role name
  */
class User(id:Int, name:String, role_name:String) {

  /** static defined class field*/
  var role = role_name
  /** public class field username*/
  var username = name
  /** public class field id*/
  var userid:Int = id

  /**
    * Return User as JavaMap. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Java Map / JSON of User Data
    */
  def asJavaMap(): util.Map[String, String] =
  {
    Map("userid" -> this.userid.toString, "username" -> this.username, "role" -> this.role).asJava
  }

}
