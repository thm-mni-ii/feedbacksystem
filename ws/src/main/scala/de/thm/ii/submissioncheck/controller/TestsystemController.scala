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
@RequestMapping(path = Array("/api/v1/testsystems"))
class TestsystemController {
  @Autowired
  private val userService: UserService = null

  /*@Autowired
  private val courseService: CourseService = null
  @Autowired
  private val taskService: TaskService = null*/

  private final val application_json_value = "application/json"

  private final val PATH_LABEL_ID = "id"

  /**
    * getAllTestystems is a route to get all available task systems
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllTestystems(request: HttpServletRequest): List[Map[String, String]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
        throw new UnauthorizedException
    }
    // TODO Return all tasksystems
    //
  }

  /**
    * createTestsystem is a route to register a tasksystem
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def createTestsystem(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      // this.courseService.createCourseByUser(user.get, name, description, standard_task_typ)
      // TODO create test system
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, standard_task_typ")
    }
  }

  /**
    * updateTestsystem is a route to register a tasksystem
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updateTestsystem(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      // this.courseService.createCourseByUser(user.get, name, description, standard_task_typ)
      // TODO update test system
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, standard_task_typ")
    }
  }

  /**
    * getTestsystem provides Testsystem details
    * @param systemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET), consumes = Array())
  @ResponseBody
  def getTestsystem(@PathVariable systemid: Int, request: HttpServletRequest) = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    //courseService.getCourseDetails(courseid, user.get).getOrElse(Map.empty)
    // TODO get system info
  }
  /**
    * deleteTestsystem deletes a Testsystem
    * @param systemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.DELETE), consumes = Array())
  @ResponseBody
  def deleteTestsystem(@PathVariable(PATH_LABEL_ID) systemid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 1) { // has to be admin
      throw new UnauthorizedException
    }

    // courseService.deleteCourse(courseid)
    // TODO Delete testsystem
  }
}
