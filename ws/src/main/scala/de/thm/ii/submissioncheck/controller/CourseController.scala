package de.thm.ii.submissioncheck.controller

import java.util

import de.thm.ii.submissioncheck.misc.UnauthorizedException
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{CourseService, UserService}
import javax.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.{PathVariable, RequestMapping, RequestMethod, ResponseBody, RestController}

import scala.collection.JavaConverters._

@RestController
@RequestMapping(path = Array("/api/v1/courses"))
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
  def getAllCourses(request:HttpServletRequest ): util.List[util.Map[String, String]] = {
    // TODO If admin -> all, if prof -->
    val user:User = userService.verfiyUserByHeaderToken(request)
    if(user == null)
      {
        throw new UnauthorizedException
      }
    courseService.getCoursesByUser(user)
  }

  /**
    * createCourse is a route to create a course
    * @param name course name
    * @param description course description
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST))
  def createCourse(name: String, description: String, request:HttpServletRequest ): util.Map[String, String] = {
    // TODO: nothing done yet, we need a service
    val user:User = userService.verfiyUserByHeaderToken(request)
    if(user == null)
    {
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
  @RequestMapping(value = Array("/{id}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCourse(@PathVariable("id") courseid: String, request:HttpServletRequest ): util.Map[String, String] = {
    // If admin -> all, if prof -->
    val user:User = userService.verfiyUserByHeaderToken(request)
    if(user == null)
    {
      throw new UnauthorizedException
    }
    courseService.getCourseDetailes(courseid, user)
  }

}
