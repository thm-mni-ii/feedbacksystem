package de.thm.ii.fbs.services.conferences

import java.net.URI

import de.thm.ii.fbs.model.User
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
  val courseId: String

  /**
    * The visibility of the Conference
    */
  val visibility: String

  /**
    * Gets the http URL for the conference
    * @param user the user for which to generate the URL
    * @param moderator the type of url to generate
    * @return the conference url
    */
  def getURL(user: User, moderator: Boolean = false): URI

  /**
    * Creates a map containing information about the Conference
    * @return the map
    */
  def isVisible: Boolean = visibility == "true"

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
