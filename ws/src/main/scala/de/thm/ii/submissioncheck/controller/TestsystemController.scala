package de.thm.ii.submissioncheck.controller

import java.util.Iterator
import java.{io, util}

import com.fasterxml.jackson.databind.{DeserializationFeature, JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.services._
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.{RequestMapping, _}
import scala.reflect.ClassTag
import scala.reflect._
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

  private final val PATH_LABEL_ID = "id"

  /**
    * getAllTestystems is a route to get all available task systems
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllTestystems(request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
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
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      testsystemService.insertTestsystem(jsonNode)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: id, name, description, supported_formats")
    }
  }

  /**
    * updateTestsystem is a route to register a tasksystem
    * @param testsystemid unique course identification
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{testsystemid}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updateTestsystem(@PathVariable testsystemid: String, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      Map("success" -> testsystemService.updateTestsystem(testsystemid, jsonNode))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, supported_formats")
    }
  }

  /**
    * getTestsystem provides Testsystem details
    * @author Benjamin Manns
    * @param testsystemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{testsystemid}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTestsystem(@PathVariable testsystemid: String, request: HttpServletRequest): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)

    // TODO maybe dont allow for all then use this lines
    // TODO || (user.get.roleid > 2 && !userService.checkIfUserAtLeastOneDocent(user.get.userid))

    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    val testsystem = testsystemService.getTestsystem(testsystemid)
    if (testsystem.isEmpty) {
      Map.empty
    } else {
      testsystem.get.asMap()
    }
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
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 1) { // has to be admin
      throw new UnauthorizedException
    }

    Map("success" -> testsystemService.deleteTestsystem(systemid))
  }
}
