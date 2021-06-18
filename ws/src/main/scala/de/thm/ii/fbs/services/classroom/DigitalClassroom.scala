package de.thm.ii.fbs.services.classroom

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.services.conferences.BBBService
import de.thm.ii.fbs.services.conferences.conference.Conference
import org.json.JSONObject

import java.net.URI

/**
  * A digital classroom
  * @param id The id of the classroom
  * @param courseId The courseid of the classroom
  * @param meetingPassword The meeting password of the classroom
  * @param moderatorPassword The moderator password of the classroom
  * @param classroomService The ClassroomService used internaly to create the classroom URLs
  */
class DigitalClassroom(override val id: String, override val courseId: Int,
                       val meetingPassword: String, val moderatorPassword: String,
                       private val classroomService: ClassroomService) extends Conference {
  /**
    * The name of the ConferenceService used to create the Conference
    */
  override val serviceName: String = ClassroomService.name
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
