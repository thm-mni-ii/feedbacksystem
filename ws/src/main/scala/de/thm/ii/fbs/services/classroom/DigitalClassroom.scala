package de.thm.ii.fbs.services.classroom

import de.thm.ii.fbs.model.CourseRole.{DOCENT, TUTOR}
import de.thm.ii.fbs.model.{CourseRole, User}
import de.thm.ii.fbs.services.conferences.conference.Conference
import org.json.JSONObject

import java.net.URI

/**
  * A digital classroom
  * @param courseId The courseId of the classroom
  * @param studentPassword The student password of the classroom
  * @param tutorPassword The tutor password of the classroom
  * @param docentPassword The docent password of the classroom
  * @param classroomService The ClassroomService used internaly to create the classroom URLs
  */
class DigitalClassroom(val courseId: Int,
                       val studentPassword: String,
                       val tutorPassword: String,
                       val docentPassword: String,
                       private val classroomService: ClassroomService) {
  /**
    * Gets the url to the Conference
    * @param user the user for which to generate the URL
    * @param moderator the type of url to generate
    * @return the conference url
    */
  def getURL(user: User, moderator: Boolean): URI =
    classroomService.getBBBConferenceLink(user, courseId, if (moderator) docentPassword else studentPassword)

  /**
    * Gets the url to the Conference
    * @param user the user for which to generate the URL
    * @param courseRole the course role
    * @return the conference url
    */
  def getURL(user: User, courseRole: CourseRole.Value): URI =
    classroomService.getBBBConferenceLink(user, courseId, courseRole match {
      case DOCENT => docentPassword
      case TUTOR => tutorPassword
      case _ => studentPassword
    })


  /**
    * Ends the Conferences
    */
  def end(): Unit =
    classroomService.endClassroom(courseId, docentPassword)

}
