package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.services._
import de.thm.ii.fbs.util.{BadRequestException, ResourceNotFoundException, UnauthorizedException, Users}
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.{RequestMapping, _}

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/testsystems"))
class TestsystemController {
  @Autowired
  private implicit val userService: UserService = null

//  @Autowired
//  private val testsystemService: TestsystemService = null
//
//  private final val PATH_LABEL_ID = "id"

  /**
    * getAllTestystems is a route to get all available task systems
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllTestystems(request: HttpServletRequest): String = {
    Users.claimAuthorization(request)
    // testsystemService.getTestsystems()

    "[" + GitChecker.checkers.values.mkString(",") + "]"
  }

//  /**
//    * createTestsystem is a route to register a tasksystem
//    * @param request contain request information
//    * @param jsonNode contains JSON request
//    * @return JSON
//    */
//  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
//  def createTestsystem(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
//    val user = Users.claimAuthorization(request)
//    if (user.roleid > 2) {
//      throw new UnauthorizedException
//    }
//    try {
//      testsystemService.insertTestsystem(jsonNode)
//    } catch {
//      case _: NullPointerException => throw new BadRequestException("Please provide: id, name, description, supported_formats")
//    }
//  }

//  /**
//    * updateTestsystem is a route to register a tasksystem
//    * @param testsystemid unique course identification
//    * @param request contain request information
//    * @param jsonNode contains JSON request
//    * @return JSON
//    */
//  @RequestMapping(value = Array("{testsystemid}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
//  def updateTestsystem(@PathVariable testsystemid: String, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
//    val user = Users.claimAuthorization(request)
//    if (user.roleid > 2) {
//      throw new UnauthorizedException
//    }
//    try {
//      Map("success" -> testsystemService.updateTestsystem(testsystemid, jsonNode))
//    } catch {
//      case _: NullPointerException => throw new BadRequestException("Please provide: name, description, supported_formats")
//    }
//  }

  /**
    * getTestsystem provides Testsystem details
    * @author Benjamin Manns
    * @param testsystemid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{testsystemid}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTestsystem(@PathVariable testsystemid: String, request: HttpServletRequest): String = {
    Users.claimAuthorization(request)

    // TODO maybe dont allow for all then use this lines
    // TODO || (user.get.roleid > 2 && !userService.checkIfUserAtLeastOneDocent(user.get.userid))

    //val testsystem = testsystemService.getTestsystem(testsystemid)
    val testsystem = GitChecker.checkers.get(testsystemid)
    if (testsystem.isEmpty) {
      throw new ResourceNotFoundException
    } else {
      testsystem.get
    }
  }

//  /**
//    * deleteTestsystem deletes a Testsystem
//    * @param systemid unique course identification
//    * @param request Request Header containing Headers
//    * @return JSON
//    */
//  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.DELETE), consumes = Array())
//  @ResponseBody
//  def deleteTestsystem(@PathVariable(PATH_LABEL_ID) systemid: String, request: HttpServletRequest): Map[String, Boolean] = {
//    val user = Users.claimAuthorization(request)
//    if (user.roleid > 1) { // has to be admin
//      throw new UnauthorizedException
//    }
//
//    Map("success" -> testsystemService.deleteTestsystem(systemid))
//  }
}
