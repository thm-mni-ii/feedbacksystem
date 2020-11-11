package de.thm.ii.fbs.services.conferences.conference

import java.net.URI

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.services.conferences.BBBService
import org.json.JSONObject

/**
  * A BBB Conference
  * @param id The id of the conference
  * @param courseId The courseid of the Conference
  * @param meetingPassword The meeting password of the conference
  * @param moderatorPassword The moderator password of the conference
  * @param bbbService The BBBService used internaly to create the bbb URLs
  */
class BBBConference(override val id: String, override val courseId: Int,
                    val meetingPassword: String, val moderatorPassword: String,
                    private val bbbService: BBBService) extends Conference {
  /**
    * The name of the ConferenceService used to create the Conference
    */
  override val serviceName: String = BBBService.name
  /**
    * The visibility of the Conference
    */
  override var isVisible: Boolean = true

  /**
    * Gets the url to the Conference
    * @param user the user for which to generate the URL
    * @param moderator the type of url to generate
    * @return the conference url
    */
  override def getURL(user: User, moderator: Boolean): URI =
    bbbService.getBBBConferenceLink(user, id, if (moderator) moderatorPassword else meetingPassword)

  /**
    * Ends the Conferences
    */
  override def end(): Unit =
    bbbService.endBBBConference(id, moderatorPassword)

  /**
    * Creates a map containing information about the Conference
    *  @return the map
    */
  override def toMap: Map[String, String] = Map(
    "meetingId" -> id,
    "meetingPassword" -> meetingPassword,
    "moderatorPassword" -> moderatorPassword,
    "service" -> serviceName
  )

  /**
    * Creates a JSONObject containing information about the Conference
    * @return the JSONObject
    */
  override def toJson: JSONObject = new JSONObject().put("meetingId", id)
    .put("courseId", courseId)
    .put("service", serviceName)
    .put("meetingPassword", meetingPassword)
    .put("moderatorPassword", moderatorPassword)
    .put("visibility", isVisible)
}
