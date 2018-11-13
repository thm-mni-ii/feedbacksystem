package de.thm.ii.submissioncheck.controller

import java.{io, util}
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{CourseService, UserService}
import javax.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation._

@RestController
@RequestMapping(path = Array("/api/v1/courses/"))
class CourseController {
  /** Class field to perform JWT Auth*/
  private val userService: UserService = new UserService()

  private val courseService: CourseService = new CourseService()

  private final val application_json_value = "application/json"

  /**
    * getAllCourses is a route for all courses
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllCourses(request: HttpServletRequest): util.List[util.Map[String, String]] = {
    // TODO If admin -> all, if prof -->
    val user: User = userService.verfiyUserByHeaderToken(request)
    if (user == null) {
        throw new UnauthorizedException
    }
    courseService.getCoursesByUser(user)
  }

  /**
    * createCourse is a route to create a course
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def createCourse(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): util.Map[String, String] = {
    // TODO: nothing done yet, we need a service
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val task_typ = jsonNode.get("task_typ").asText()
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description, task_typ")
      }
    }
    val user: User = userService.verfiyUserByHeaderToken(request)
    if(user == null) {
      throw new UnauthorizedException
    }
    user.asJavaMap()
  }

  /**
    * getCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET), consumes = Array())
  @ResponseBody
  def getCourse(@PathVariable("id") courseid: Integer, request: HttpServletRequest): util.Map[_ <: String, _ >: io.Serializable with String] = {
    // If admin -> all, if prof -->
    val user: User = userService.verfiyUserByHeaderToken(request)
    if(user == null) {
      throw new UnauthorizedException
    }
    courseService.getCourseDetailes(courseid, user)
  }

  /**
    * grantCourse allows course creators and editors to grant further rights to other user
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  @ResponseBody
  def grantCourse(@PathVariable("id") courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): util.Map[String, Boolean] = {
    try {
      var username = jsonNode.get("username").asText()
      var grant_type = jsonNode.get("grant_type").asText()

      val user: User = userService.verfiyUserByHeaderToken(request)
      if (user == null) {
        throw new UnauthorizedException
      }
      if (!this.courseService.isPermittedForCourse(courseid, user)) {
        throw new UnauthorizedException
      } else {
        val userToGrant: User = userService.loadUserFromDB(username)
        if (userToGrant == null) {
          throw new BadRequestException("Please provid a valid username")
        } else {
          courseService.grandUserToACourse(grant_type, courseid, userToGrant)
        }
      }
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username, grant_type")
      }
    }
  }
}
