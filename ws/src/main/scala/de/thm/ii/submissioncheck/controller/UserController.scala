package de.thm.ii.submissioncheck.controller

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import de.thm.ii.submissioncheck.misc.{BadRequestException, ResourceNotFoundException, UnauthorizedException}
import org.springframework.web.bind.annotation._
import de.thm.ii.submissioncheck.services.{LoginService, RoleDBLabels, UserService}
import org.apache.catalina.servlet4preview.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType

/**
  * UserController defines all routes for /users (insert, delete, update). So far only a few
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class UserController {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val loginService: LoginService = null

  private final val LABEL_USERNAME = "username"
  private final val LABEL_GRANT = "grant"
  private final val LABEL_SUCCESS = "success"

  /**
    * Admin or user itself can access his personal information
    * @param userid unique user ide
    * @param request http request contains all headers
    * @return a JSON Object of all user information
    */
  @RequestMapping(value = Array("users/{userid}"), method = Array(RequestMethod.GET))
  def getAllUsers(@PathVariable userid: Int, request: HttpServletRequest): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || (user.get.roleid != 1 && user.get.userid != userid)) {
      throw new UnauthorizedException
    }
    val map = userService.getFullUserById(userid)
    if(map.isEmpty){
      // TODO "The requesting userid does not exist"
      throw new ResourceNotFoundException()
    }
    val userMap = map.get

    userMap + ("information" -> "In addition to the master data, we have your fees for the non-anonymous course tasks you have taken.")
  }

  @RequestMapping(value = Array("users/accept/privacy"), method = Array(RequestMethod.POST))
  def userAcceptPrivacy(request: HttpServletRequest) = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }

  }

  /**
    * grant a user to the global role MODERATOR
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param userid unique identification for user
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("/users/grant/{userid}"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def grantModerator(request: HttpServletRequest, @PathVariable userid: Int, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val roleid = Integer.parseInt(jsonNode.get("role").asText())

      val userToGrant = userService.loadUserFromDB(userid)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid username to grant or revoke access to")
      }
      var grantRevokeSuccess: Boolean = false
      var grantRevokeLabel: String = ""
      if (roleid == 16){
        grantRevokeSuccess = userService.revokeUser(userToGrant.get)
        grantRevokeLabel = RoleDBLabels.STUDENT
      } else if (roleid == 2){
        grantRevokeSuccess = userService.grantUser(userToGrant.get, RoleDBLabels.MODERATOR)
        grantRevokeLabel = RoleDBLabels.MODERATOR
      } else if (roleid == 1){
        grantRevokeSuccess = userService.grantUser(userToGrant.get, RoleDBLabels.ADMIN)
        grantRevokeLabel = RoleDBLabels.ADMIN
      } else {
        throw new BadRequestException("Please provide a valid role to grant or revoke a user. Requested role: " + roleid + " is invalid.")
      }

      val grantRevokeField = if (userToGrant.get.roleid < roleid) "revoke" else LABEL_GRANT
      Map(grantRevokeField -> grantRevokeLabel, LABEL_SUCCESS -> grantRevokeSuccess)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a valid field `role`.")
      case _: NumberFormatException => throw new BadRequestException("Please provide a valid field `role`.")
    }
  }

  /**
    * delete a user
    * @author Benjamin Manns
    * @param userid which user has to be deleted
    * @param request contains resquest headers
    * @return JSON
    */
  @RequestMapping(value = Array("users/{userid}"), method = Array(RequestMethod.DELETE), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def deleteAUser(@PathVariable userid: Int, request: HttpServletRequest): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    val map = userService.getFullUserById(userid)
    if(map.isEmpty){
      throw new ResourceNotFoundException()
    }
    Map("deletion" -> userService.deleteUser(userid))
  }

  /**
    * delete a list of user
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.DELETE), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def deleteUsersBatch(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val user_list = jsonNode.get("user_id_list")
      val mapper = new ObjectMapper() with ScalaObjectMapper
      val node: JsonNode = mapper.valueToTree(user_list)
      val batchListElements = node.elements()
      var success = true
      batchListElements.forEachRemaining(_ => {
        success = userService.deleteUser(batchListElements.next().asInt()) && success
      })
      Map("batch_delete"->success)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a valid user_id_list")
    }
  }

  /**
    * getAllUsers is a admin function und just sends a list of all users,
    * which filters user by its last login information
    *
    * @author Benjamin Manns
    * @param before defines where login was before a special date
    * @param after defines where login was after a special date
    * @param sort defines asc or desc of result
    * @param request contains resquest headers
    * @return JSON
    * @throws BadRequestException, UnauthorizedException
    */
  @RequestMapping(value = Array("users"), method = Array(RequestMethod.GET))
  def getLastLoginsOfUsers(@RequestParam(value = "before", required = false) before: String,
                           @RequestParam(value = "after", required = false) after: String,
                           @RequestParam(value = "sort", required = false) sort: String, request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    try {
      loginService.getLastLoginList(before, after, sort)
    }
    catch {
      case e: IllegalArgumentException => {
        throw new BadRequestException(e.getMessage)
      }
    }
  }
}
