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

  /**
    * getAllTestystems is a route to get all available task systems
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllTestystems(request: HttpServletRequest): List[Map[String, Any]] = {
    Users.claimAuthorization(request)

    GitChecker.CHECKERS.values.toList
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
    Users.claimAuthorization(request)

    // TODO maybe dont allow for all then use this lines
    // TODO || (user.get.roleid > 2 && !userService.checkIfUserAtLeastOneDocent(user.get.userid))

    //val testsystem = testsystemService.getTestsystem(testsystemid)
    val testsystem = GitChecker.CHECKERS.get(testsystemid)
    if (testsystem.isEmpty) {
      throw new ResourceNotFoundException
    } else {
      testsystem.get
    }
  }
}
