package de.thm.ii.submissioncheck.controller

import java.nio.file.{Files, Path, Paths}
import java.util.zip.{ZipEntry, ZipOutputStream}
import java.{io, util}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, ResourceNotFoundException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import de.thm.ii.submissioncheck.services._
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.UrlResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@RequestMapping(path = Array("/api/v1/courses"))
class CourseController {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val taskService: TaskService = null
  /** holds connection to storageService*/
  val storageService = new StorageService

  private final val application_json_value = "application/json"

  private final val PATH_LABEL_ID = "id"

  private final val PATH_REST_LABEL_ID = "{id}"

  private final val LABEL_DOCENT = "docent"

  private final val LABEL_ADMIN = "admin"

  private final val LABEL_NAME = "name"

  private final val LABEL_USERNAME = "username"

  private final val LABEL_DESCRIPTION = "description"

  private final val PLEASE_PROVIDE_COURSE_LABEL = "Please provide: name, description, standard_task_typ, course_semester, course_modul_id, anonymous"

  private final val PLEASE_PROVIDE_COURSE_LABEL_UPDATE = "Please provide: name, description, standard_task_typ, course_semester, course_modul_id"

  /**
    * getAllCourses is a route for all courses
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllCourses(request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
        throw new UnauthorizedException
    }
    courseService.getAllKindOfCoursesByUser(user.get)
  }

  /**
    * createCourse is a route to create a course
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def createCourse(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Number] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 2) { // only ADMIN or MODERATOR can create a course
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get(LABEL_NAME).asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      val course_semester = jsonNode.get("course_semester").asText()
      val course_modul_id = jsonNode.get("course_modul_id").asText()
      val anonymous = jsonNode.get("anonymous").asInt()
      this.courseService.createCourseByUser(user.get, name, description, standard_task_typ, course_modul_id, course_semester, anonymous)
    } catch {
      case _: NullPointerException => throw new BadRequestException(PLEASE_PROVIDE_COURSE_LABEL)
    }
  }

  /**
    * getAllCourse provides all courses for searching purpose
    *
    * @author Benjamin Manns
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("all"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getAllCourse(request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getAllCourses(user.get)
  }

  /**
    * getCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[_ <: String, _ >: io.Serializable with String] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getCourseDetails(courseid, user.get).getOrElse(Map.empty)
  }

  /**
    * Generates a zip of one user submissions of one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param userid unique user identification
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param request Request Header containing Headers
    * @return Zip File
    */
  @RequestMapping(value = Array("{courseid}/submission/users/{userid}/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfUserFromCourse(@PathVariable courseid: Integer, @PathVariable userid: Int,
                                          @RequestParam(value = "only_last_try", required = false) only_last_try: Boolean,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || (!courseService.isDocentForCourse(courseid, user.get) && user.get.userid != userid)) {
      throw new UnauthorizedException
    }

    val requestedUser = userService.loadUserFromDB(userid)
    if (requestedUser.isEmpty) {
      throw new ResourceNotFoundException
    }

    val resource = new UrlResource(Paths.get(courseService.zipOfSubmissionsOfUserFromCourse(only_last_try, courseid, requestedUser.get)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename + "\"").body(resource)
    } else {
      throw new RuntimeException("Zip file could not be found.")
    }
  }

  /**
    * Generates a zip of all user submissions  of one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param request Request Header containing Headers
    * @return Zip File
    */
  @RequestMapping(value = Array("{courseid}/submission/users/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfUserFromCourse(@PathVariable courseid: Integer,
                                          @RequestParam(value = "only_last_try", required = false) only_last_try: Boolean,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isDocentForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }

    val resource = new UrlResource(Paths.get(courseService.zipOfSubmissionsOfUsersFromCourse(only_last_try, courseid)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename + "\"").body(resource)
    } else {
      throw new RuntimeException("Zip file could not be found.")
    }
  }

  /**
    * deleteCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.DELETE), consumes = Array())
  @ResponseBody
  def deleteCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if (user.get.roleid > 2) { // Only moderator and admin can delete a course
      throw new UnauthorizedException
    }
    courseService.deleteCourse(courseid)
  }

  /**
    * updateCourse updates course details for a specific course by given id
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode Request Body
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.PUT), consumes = Array())
  @ResponseBody
  def updateCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if(!this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get(LABEL_NAME).asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      val course_semester = jsonNode.get("course_semester").asText()
      val course_modul_id = jsonNode.get("course_modul_id").asText()

      if (name.length == 0 || description.length == 0 || standard_task_typ.length == 0) {
        throw new BadRequestException(PLEASE_PROVIDE_COURSE_LABEL_UPDATE)
      }
      this.courseService.updateCourse(courseid, name, description, standard_task_typ, course_modul_id, course_semester)
    } catch {
      case _: NullPointerException => throw new BadRequestException(PLEASE_PROVIDE_COURSE_LABEL)
    }
  }
  /**
    * subscribe a user to a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/subscribe"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def subscribeCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    // TODO here one can make some password protection or something else protection
    this.courseService.subscribeCourse(courseid, user.get)
  }

  /**
    * unsubscribe a user from a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/unsubscribe"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def unsubscribeCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    this.courseService.unsubscribeCourse(courseid, user.get)
  }

  /**
    * grantTutorToCourse allows a course docent to give access as tutor
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant/tutor"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def grantTutorToCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val user = userService.verfiyUserByHeaderToken(request)
      if (user.isEmpty || !courseService.isDocentForCourse(courseid, user.get)) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provid a valid username")
      }
      courseService.grandUserAsTutorForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: username for gran tutor")
    }
  }

  /**
    * grantDocentToCourse allows a moderator to grand user as a docent for a course
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant/docent"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def grantDocentToCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest,
                          @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val requestingUser = userService.verfiyUserByHeaderToken(request)
      if (requestingUser.isEmpty || requestingUser.get.roleid != 2) { // Only a moderator can do this
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid username as a docent")
      }
      courseService.grandUserAsDocentForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: username to grant docent")
    }
  }

  /**
    * denyTutorToCourse allows a course docent (and moderator) to give access as tutor
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/deny/tutor"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def denyTutorForCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val user = userService.verfiyUserByHeaderToken(request)
      if (user.isEmpty || (!courseService.isDocentForCourse(courseid, user.get) && user.get.roleid != 4)) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provid a valid username which is a tutor")
      }
      courseService.denyUserAsTutorForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: username")
    }
  }

  /**
    * denyDocentForCourse allows moderator to deny a course docent
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/deny/docent"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def denyDocentForCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest,
                          @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val user = userService.verfiyUserByHeaderToken(request)
      if (user.isEmpty || user.get.roleid != 2) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid username which is a docent")
      }
      courseService.denyUserAsDocentForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: username")
    }
  }

  /**
    * Implements the REST route for docents who want to get all results of all users of all tasks
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/submissions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissions(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): List[Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isDocentForCourse(courseid, user.get) && user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    // old version
    // this.courseService.getAllSubmissionsFromAllUsersByCourses(courseid)
    this.courseService.getSubmissionsMatrixByCourse(courseid)
  }

  /**
    * get the detailed submission information of a student of a task for this one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param userid unique identification for a user
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{courseid}/submissions/user/{userid}/task/{taskid}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeStudentTaskSubmissionsMatrixCell(@PathVariable courseid: Int, @PathVariable userid: Int, @PathVariable taskid: Int,
                                          request: HttpServletRequest): List[Any] = {
    // TODO courseid not needed
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!taskService.isPermittedForTask(taskid, user.get) && user.get.roleid > 2 && user.get.userid != userid) {
      throw new UnauthorizedException
    }

    taskService.getSubmissionsByTaskAndUser(taskid.toString, userid, "desc")
  }

  /**
    * get a List of all submissions and information from which course
    * @author Benjamin Manns
    * @param request request Request Header containing Headers for Authorization
    * @return JSON of all submissions
    */
  @RequestMapping(value = Array("submissions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissions(request: HttpServletRequest): List[Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    // old version
    // this.courseService.getAllSubmissionsForAllCoursesByUser(user.get)

    this.courseService.getSubmissionsMatrixByUser(user.get.userid)
  }
}
