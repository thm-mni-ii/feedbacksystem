package de.thm.ii.fbs.services.classroom

import de.thm.ii.fbs.model.CourseRole.{DOCENT, TUTOR}
import de.thm.ii.fbs.model.{CourseRole, User}
import de.thm.ii.fbs.services.conferences.conference.Conference
import org.json.JSONObject

import java.net.URI

/**
  * A digital classroom
  * @param id The id of the classroom
  * @param courseId The courseId of the classroom
  * @param studentPassword The student password of the classroom
  * @param tutorPassword The tutor password of the classroom
  * @param docentPassword The docent password of the classroom
  * @param classroomService The ClassroomService used internaly to create the classroom URLs
  */
class DigitalClassroom(override val id: String, override val courseId: Int,
                       val studentPassword: String, val tutorPassword: String, val docentPassword: String,
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
  @deprecated
  override def getURL(user: User, moderator: Boolean): URI =
    classroomService.getBBBConferenceLink(user, id, if (moderator) docentPassword else studentPassword)

  /**
    * Gets the url to the Conference
    * @param user the user for which to generate the URL
    * @param courseRole the course role
    * @return the conference url
    */
  def getURL(user: User, courseRole: CourseRole.Value): URI =
    classroomService.getBBBConferenceLink(user, id, courseRole match {
      case DOCENT => docentPassword
      case TUTOR => tutorPassword
      case _ => studentPassword
    })


  /**
    * Ends the Conferences
    */
  override def end(): Unit =
    classroomService.endBBBConference(id, docentPassword)

  /**
    * Creates a map containing information about the Conference
    *  @return the map
    */
  override def toMap: Map[String, String] = Map(
    "meetingId" -> id,
    "studentPassword" -> studentPassword,
    "tutorPassword" -> tutorPassword,
    "docentPassword" -> docentPassword,
    "service" -> serviceName
  )

  /**
    * Creates a JSONObject containing information about the Conference
    * @return the JSONObject
    */
  override def toJson: JSONObject = new JSONObject().put("meetingId", id)
    .put("courseId", courseId)
    .put("service", serviceName)
    .put("studentPassword", studentPassword)
    .put("tutorPassword", tutorPassword)
    .put("docentPassword", docentPassword)
    .put("visibility", isVisible)
}
