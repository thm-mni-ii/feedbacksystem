package de.thm.ii.submissioncheck.model

import java.util
import scala.collection.JavaConverters._

/**
  * Class User holds all data from the user table
  *
  * @author Benjamin Manns
  * @param name User's username
  */
class User(name:String) {

  /** static defined class field*/
  var role = "STUDENT"
  /** public class field username*/
  var username = name

  /**
    * Return User as JavaMap. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Java Map / JSON of User Data
    */
  def asJavaMap(): util.Map[String, String] =
  {
    Map("username" -> this.username, "role" -> this.role).asJava
  }

}
