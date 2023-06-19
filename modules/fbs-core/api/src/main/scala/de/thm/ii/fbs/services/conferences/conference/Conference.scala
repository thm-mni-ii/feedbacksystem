package de.thm.ii.fbs.services.conferences.conference

import de.thm.ii.fbs.model.v2.security.authentication.User
import java.net.URI
import org.json.JSONObject

/**
  * A Conference created by a ConferenceService
  */
abstract class Conference {
  /**
    * The id of the conference
    */
  val id: String

  /**
    * The name of the ConferenceService used to create the Conference
    */
  val serviceName: String

  /**
    * The courseid of the Conference
    */
  val courseId: Int

  /**
    * The visibility of the Conference
    */
  var isVisible: Boolean

  /**
    * Gets the http URL for the conference
    * @param user the user for which to generate the URL
    * @param moderator the type of url to generate
    * @return the conference url
    */
  def getURL(user: User, moderator: Boolean = false): URI

  /**
    * Ends the Conferences
    */
  def end(): Unit

  /**
    * Creates a map containing information about the Conference
    * @return the map
    */
  def toMap: Map[String, String]

  /**
    * Creates a JSONObject containing information about the Conference
    * @return the JSONObject
    */
  def toJson: JSONObject
}
