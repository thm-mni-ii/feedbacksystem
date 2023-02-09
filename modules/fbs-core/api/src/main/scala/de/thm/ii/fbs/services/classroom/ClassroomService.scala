package de.thm.ii.fbs.services.classroom

import de.thm.ii.fbs.model.CourseRole.{DOCENT, STUDENT, TUTOR}
import de.thm.ii.fbs.model.GlobalRole.{ADMIN, MODERATOR}
import de.thm.ii.fbs.model.classroom.JoinRoomBBBResponse
import de.thm.ii.fbs.model.{CourseRole, User}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, CourseService}
import org.apache.commons.codec.digest.DigestUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

import java.net.URI
import java.util.UUID
import scala.collection.mutable
import scala.language.postfixOps

/**
  * Handles BBB requests.
  *
  * @param templateBuilder           Request template builder.
  * @param classroomUrl              the bbb api url
  * @param secret                    the bbb secret
  * @param courseService             the CourseService
  * @param courseRegistrationService the CourseRegistrationService
  * @author Dominik Kröll
  */
@Service
class ClassroomService(templateBuilder: RestTemplateBuilder,
                       @Value("${services.classroom.classroom-url}") private val classroomUrl: String,
                       @Value("${services.classroom.classroom-secret}") private val secret: String,
                       @Value("${services.classroom.insecure}") private val insecure: Boolean,
                       courseService: CourseService,
                       courseRegistrationService: CourseRegistrationService
                      ) {
  private val restTemplate = new RestTemplate()

  private val classrooms = mutable.HashMap[Int, DigitalClassroom]()

  def joinUser(courseId: Int, user: User): URI = {
    val courseRole = courseRegistrationService.getCoursePrivileges(user.id).getOrElse(courseId, STUDENT)
    val classroom = classrooms.getOrElseUpdate(courseId, createClassroom(courseId))
    getBBBConferenceLink(user, classroom, courseRole)
  }

  /**
    * Future feature? currently there is no attendance tracking in FBS
    *
    * @param courseId the courseId
    * @param user     the user
    * @return
    */
  def leaveUser(courseId: Int, user: User): Boolean = {
    true
  }

  /**
    * Creates a new Conference using BBB
    *
    * @param courseId the id for the new conference
    * @return the newly created conference
    */
  def createClassroom(courseId: Int): DigitalClassroom = {
    val classroomId = UUID.randomUUID().toString
    val course = courseService.find(courseId).get
    val studentPassword = UUID.randomUUID().toString
    val tutorPassword = UUID.randomUUID().toString
    val teacherPassword = UUID.randomUUID().toString

    // actual registering of conference against BBB api
    this.registerDigitalClassroom(classroomId, s"FBS: ${course.name}", studentPassword, tutorPassword, teacherPassword)
    new DigitalClassroom(classroomId, courseId, studentPassword, tutorPassword, teacherPassword)
  }

  def recreateClassroom(courseId: Int): Unit = {
    val course = courseService.find(courseId).get
    val classroom = this.classrooms(courseId)
    this.registerDigitalClassroom(classroom.classroomId, s"FBS: ${course.name}", classroom.studentPassword, classroom.tutorPassword, classroom.teacherPassword)
  }

  /**
    * Register a new conference.
    *
    * @param id              Conference id to register.
    * @param meetingName     Conference id to register.
    * @param studentPassword password to register.
    * @param tutorPassword   tutor passwort to register
    * @param teacherPassword moderator password to register.
    * @return boolean showing if creation of room was successful
    */
  def registerDigitalClassroom(id: String, meetingName: String, studentPassword: String, tutorPassword: String, teacherPassword: String): Boolean = {
    val request = Map(
      "name" -> meetingName,
      "meetingID" -> id,
      "attendeePW" -> studentPassword,
      "tutorPW" -> tutorPassword,
      "moderatorPW" -> teacherPassword,
      "meta_bbb-origin" -> "Greenlight"
    )
    val response = getClassroomApi("create", request)
    response.getStatusCode.is2xxSuccessful()
  }

  /**
    * Get join Link for conference users conference.
    *
    * @param user             user name to join to classroom.
    * @param digitalClassroom the digitalClassroomInstance to join a user to.
    * @param courseRole       The role (Docent, Tutor, Student) of the user within the course.
    * @return The join URI for the specified user.
    */
  def getBBBConferenceLink(user: User, digitalClassroom: DigitalClassroom, courseRole: CourseRole.Value): URI = {
    val paramMap = Map(
      "fullName" -> s"${user.prename} ${user.surname}",
      "meetingID" -> digitalClassroom.classroomId,
      "password" -> ((courseRole, user.globalRole) match {
        case (_, ADMIN) => digitalClassroom.teacherPassword
        case (DOCENT, _) => digitalClassroom.teacherPassword
        case (_, MODERATOR) => digitalClassroom.tutorPassword
        case (TUTOR, _) => digitalClassroom.tutorPassword
        case (_, _) => digitalClassroom.studentPassword
      })
    )
    val url = buildClassroomApiRequestUri("join", paramMap)
    var response: JoinRoomBBBResponse = null
    try {
      response = getJoinRoomResponse(url)
    } catch {
      case _: Throwable =>
        recreateClassroom(digitalClassroom.courseId)
        response = getJoinRoomResponse(url)
    }
    URI.create(response.url)
  }

  private def getJoinRoomResponse(url: String): JoinRoomBBBResponse = {
    val response = restTemplate.getForEntity(url, classOf[JoinRoomBBBResponse])
    response.getBody
  }

  /**
    * Ends the conference
    *
    * @param courseId        the id of the meeting to end
    * @param teacherPassword the teacherPassword of the meeting to end
    * @return true if request succeeds
    */
  def endClassroom(courseId: Int, teacherPassword: String): Boolean = {
    val classroom = classrooms(courseId)
    val response = getClassroomApi("end", Map("meetingID" -> classroom.classroomId, "password" -> teacherPassword))
    response.getStatusCode.is2xxSuccessful()
  }

  /**
    * Sends a GET-Request to the BBB API
    *
    * @param method The BBB methode to invoked
    * @param params The params to send
    * @return The ResponseEntity
    */
  private def getClassroomApi(method: String, params: Map[String, String]): ResponseEntity[String] = {
    val url = buildClassroomApiRequestUri(method, params)
    restTemplate.getForEntity(url, classOf[String])
  }

  /**
    * Builds a BBB API URL with checksum
    *
    * @param method The method of the url
    * @param params The params of the url
    * @return The BBB API with checksum
    */
  private def buildClassroomApiRequestUri(method: String, params: Map[String, String]): String = {
    val queryBuilder = UriComponentsBuilder.newInstance()
    for ((key, value) <- params) {
      queryBuilder.queryParam(key, value.replace(" ", "+"))
    }
    var query = queryBuilder.cloneBuilder().encode.build.toString.substring(1)
    val checksum = DigestUtils.sha1Hex(s"$method$query$secret")
    queryBuilder.queryParam("checksum", s"$checksum")
    query = queryBuilder.build.toString.substring(1)
    s"$classroomUrl/api/$method?$query"
  }
}
