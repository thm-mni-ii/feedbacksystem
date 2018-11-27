package de.thm.ii.submissioncheck.controller

import java.{io, util}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{CourseService, TaskService, UserService}
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
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

  private final val application_json_value = "application/json"

  private final val PATH_LABEL_ID = "id"

  /**
    * getAllCourses is a route for all courses
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllCourses(request: HttpServletRequest): List[Map[String, String]] = {
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
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    val allowedRoles = List("admin", "dozent")
    if (!allowedRoles.contains(user.get.role)) throw new UnauthorizedException
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      this.courseService.createCourseByUser(user.get, name, description, standard_task_typ)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, standard_task_typ")
    }
  }

  /**
    * getCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET), consumes = Array())
  @ResponseBody
  def getCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[_ <: String, _ >: io.Serializable with String] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getCourseDetails(courseid, user.get).getOrElse(Map.empty)
  }
  /**
    * deleteCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.DELETE), consumes = Array())
  @ResponseBody
  def deleteCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    courseService.deleteCourse(courseid)
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
    if (user.get.role == "dozent") {
      throw new BadRequestException("User with role `dozent` can not subscribe a course.")
    }
    this.courseService.subscribeCourse(courseid, user.get)
  }

  /**
    * Create a task for a given course
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/tasks"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def createTask(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new BadRequestException("User with role `student` and no edit rights can not create a task.")
    }
    try {
      var name = jsonNode.get("name").asText()
      var description = jsonNode.get("description").asText()
      var filename = jsonNode.get("filename").asText()
      var test_type = jsonNode.get("test_type").asText()
      this.taskService.createTask(name, description, courseid, filename, test_type)
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description, filename, test_type")
      }
    }
  }

  /**
    * grantCourse allows course creators and editors to grant further rights to other user
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def grantCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get("username").asText()
      val grant_type = jsonNode.get("grant_type").asText()

      val user = userService.verfiyUserByHeaderToken(request)
      if (user.isEmpty) {
        throw new UnauthorizedException
      }
      if (!this.courseService.isPermittedForCourse(courseid, user.get)) {
        throw new UnauthorizedException
      } else {
        val userToGrant = userService.loadUserFromDB(username)
        if (userToGrant.isEmpty) {
          throw new BadRequestException("Please provid a valid username")
        } else {
          courseService.grandUserToACourse(grant_type, courseid, userToGrant.get)
        }
      }
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: username, grant_type")
    }
  }

  /**
    * Implements the REST route for docents who want to get all results of all users of all tasks
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/submissions"), method = Array(RequestMethod.GET), consumes = Array(application_json_value))
  @ResponseBody
  def seeAllSubmissions(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode):
  List[Map[String, Any]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    this.courseService.getAllSubmissionsFromAllUsersByCourses(courseid)
  }
}
