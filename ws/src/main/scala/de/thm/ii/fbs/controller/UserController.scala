package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import de.thm.ii.fbs.services.labels.RoleDBLabels
import org.springframework.web.bind.annotation._
import de.thm.ii.fbs.services.{LoginService, UserService}
import de.thm.ii.fbs.util.{BadRequestException, ResourceNotFoundException, UnauthorizedException, Users}
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType

/**
  * UserController defines all routes for /users (insert, delete, update). So far only a few
  *
  * @author Benjamin Manns
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1"))
class UserController {
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val loginService: LoginService = null

  private final val LABEL_SUCCESS = "success"

  /**
    * Admin or user itself can access his personal information
    * @param userid unique user ide
    * @param request http request contains all headers
    * @return a JSON Object of all user information
    */
  @RequestMapping(value = Array("users/{userid}"), method = Array(RequestMethod.GET))
  def getAUser(@PathVariable userid: Int, request: HttpServletRequest): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid != 1 && user.userid != userid) {
      throw new UnauthorizedException
    }
    val map = userService.getFullUserById(userid)
    if(map.isEmpty){
      // TODO "The requesting userid does not exist"
      throw new ResourceNotFoundException()
    }
    map.get
  }

  /**
    * set a new password for a guest account
    * @param userid user identification
    * @param request http request contains all headers
    * @param jsonNode http request contains all headers
    * @return success state
    */
  @RequestMapping(value = Array("users/{userid}/passwd"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updateGuestUserPassword(@PathVariable userid: Int, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (user.userid != userid && user.roleid != 1) {
      throw new UnauthorizedException
    }
    if (user.password == null){
      throw new BadRequestException("This user has no guest account, a password can not set")
    }
    if (!jsonNode.hasNonNull("passwd") || !jsonNode.hasNonNull("passwd_repeat")) {
      throw new BadRequestException("Please provide: passwd and passwd_repeat")
    }

    val passwd = jsonNode.get("passwd").asText()
    val passwd_repeat = jsonNode.get("passwd_repeat").asText()

    if (passwd.isBlank) {
      throw new BadRequestException("passwd is invalid because it is blank")
    }
    if (passwd_repeat != passwd){
      throw new BadRequestException("passwd and passwd_repeat do not match")
    }
    Map(LABEL_SUCCESS -> userService.updatePasswordByUser(userid, passwd))
  }

  /**
    * Create a guest user / login / account
    * @author Benjamin Manns
    * @param request http request contains all headers
    * @param jsonNode http request contains all headers
    * @return Map if user could be created
    */
  @RequestMapping(value = Array("users"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def createGuestUser(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val roleid = jsonNode.get("role_id").asInt()
      val prename = jsonNode.get("prename").asText()
      val surname = jsonNode.get("surname").asText()
      val password = jsonNode.get("password").asText()
      val email = jsonNode.get("email").asText()
      val username = jsonNode.get("username").asText()
      Map(LABEL_SUCCESS -> userService.createGuestAccount(prename, surname, roleid, username, password, email))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: prename, surname, password, role_id, email and username")
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
    val user = Users.claimAuthorization(request)
    if (user.roleid != 1) {
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

      Map("grant" -> grantRevokeLabel, LABEL_SUCCESS -> grantRevokeSuccess)
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
  @RequestMapping(value = Array("users/{userid}"), method = Array(RequestMethod.DELETE))
  def deleteAUser(@PathVariable userid: Int, request: HttpServletRequest): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid != 1) {
      throw new UnauthorizedException
    }
    val map = userService.getFullUserById(userid)
    if (map.isEmpty){
      Map(LABEL_SUCCESS -> false)
    } else {
      Map(LABEL_SUCCESS -> userService.deleteUser(userid))
    }
  }

  /**
    * delete a list of user
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.DELETE), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def deleteUsersBatch(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid != 1) {
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
      Map(LABEL_SUCCESS->success)
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
    * @param showDeleted filter user on deleted status
    * @param request contains resquest headers
    * @return JSON
    * @throws BadRequestException, UnauthorizedException
    */
  @RequestMapping(value = Array("users"), method = Array(RequestMethod.GET))
  def getLastLoginsOfUsers(@RequestParam(value = "before", required = false) before: String,
                           @RequestParam(value = "after", required = false) after: String,
                           @RequestParam(value = "sort", required = false) sort: String,
                           @RequestParam(value = "showDeleted", required = false) showDeleted: Boolean = false,
                           request: HttpServletRequest): List[Map[String, Any]] = {
    val user = Users.claimAuthorization(request)
    if (!userService.checkIfUserAtLeastOneDocent(user.userid) && user.roleid > 4){
      throw new UnauthorizedException
    }
    try {
      loginService.getLastLoginList(before, after, sort, showDeleted)
    } catch {
      case e: IllegalArgumentException => throw new BadRequestException(e.getMessage)
    }
  }
}
