package de.thm.ii.fbs.model

import java.security.Principal

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.module.scala.JsonScalaEnumeration
import de.thm.ii.fbs.util.ScalaObjectMapper

/**
  * User object
  * @param id local DB's userid
  * @param prename User's prename
  * @param surname User's surname
  * @param email User's email
  * @param username User's username
  * @param globalRole User's role id
  * @param alias the DB password hash
  */
class User(val prename: String, val surname: String, val email: String,
           val username: String,
           @JsonScalaEnumeration(value = classOf[GlobalRoleType]) val globalRole: GlobalRole.Value,
           val alias: Option[String] = None, val id: Int = 0) extends Principal {
  /**
    * @return unique username
    */
  override def getName: String = username

  /**
    * Compares objects instances: two users are equal if they have the same username
    * @param other Other user
    * @return true, if they have the same username.
    */
  override def equals(other: Any): Boolean = other match {
    case that: User => username.equals(that.username)
    case that: Principal => username.equals(that.getName)
    case that: Participant => username.equals(that.user.username)
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
