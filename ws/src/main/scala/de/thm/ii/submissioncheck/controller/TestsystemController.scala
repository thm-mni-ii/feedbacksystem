package de.thm.ii.submissioncheck.controller

import java.{io, util}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{CourseService, TaskService, TestsystemService, UserService}
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

  @Autowired
  private val testsystemService: TestsystemService = null

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
    testsystemService.getTestsystems()
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
      val id = jsonNode.get("id").asText()
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val supported_formats = jsonNode.get("supported_formats").asText()
      testsystemService.insertTestsystem(id, name, description, supported_formats, 8000, "000.000.000.000")
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: id, name, description, supported_formats")
    }
  }

  /**
    * updateTestsystem is a route to register a tasksystem
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{systemid}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updateTestsystem(@PathVariable systemid: String, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get("name").isNull asText()
      val description = jsonNode.get("description").asText()
      val supported_formats = jsonNode.get("supported_formats").asText()
      // this.courseService.createCourseByUser(user.get, name, description, standard_task_typ)
      Map("success" -> testsystemService.updateTestsystem(systemid, name, description, supported_formats, 8000, "000.000.000.000"))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, supported_formats")
    }
  }

  /**
    * getTestsystem provides Testsystem details
    * @param systemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{testsystemid}"), method = Array(RequestMethod.GET), consumes = Array())
  @ResponseBody
  def getTestsystem(@PathVariable testsystemid: String, request: HttpServletRequest): Map[String, String] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    testsystemService.getTestsystem(testsystemid).getOrElse(Map.empty)
  }
  /**
    * deleteTestsystem deletes a Testsystem
    * @param systemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.DELETE), consumes = Array())
  @ResponseBody
  def deleteTestsystem(@PathVariable(PATH_LABEL_ID) systemid: String, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 1) { // has to be admin
      throw new UnauthorizedException
    }

    Map("success" -> testsystemService.deleteTestsystem(systemid))
  }
}
