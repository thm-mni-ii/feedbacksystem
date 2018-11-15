package de.thm.ii.submissioncheck.controller

import java.{io, util}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{CourseService, UserService}
import javax.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

@RestController
@RequestMapping(path = Array("/api/v1/courses/"))
class CourseController {
  /** Class field to perform JWT Auth*/
  private val userService: UserService = new UserService()
  private val courseService: CourseService = new CourseService()

  /**
    * getAllCourses is a route for all courses
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllCourses(request: HttpServletRequest): util.List[util.Map[String, String]] = {
    // TODO If admin -> all, if prof -->
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
        throw new UnauthorizedException
    }
    courseService.getCoursesByUser(user.get)
  }

  /**
    * createCourse is a route to create a course
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def createCourse(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): util.Map[String, String] = {
    // TODO: nothing done yet, we need a service
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val task_typ = jsonNode.get("task_typ").asText()
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, task_typ")
    }
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    user.get.asJavaMap()
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
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getCourseDetails(courseid, user.get).getOrElse(new util.HashMap[String, String]())
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
  def grantCourse(@PathVariable("id") courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): util.Map[String, Boolean] = {
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
}
