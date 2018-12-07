package de.thm.ii.submissioncheck.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
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
    * getAllUsers is a admin function und just sends a list of all users
    *
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON of all Users
    * @throw throw new UnauthorizedException
    */
  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.GET), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def getAllUsers(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): List[Map[String, String]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    userService.getUsers
  }

  /**
    * grant a user to the global role MODERATOR
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("/users/grant/moderator"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def grantModerator(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid username to grant moderator access to")
      }
      Map(LABEL_GRANT -> RoleDBLabels.MODERATOR, LABEL_SUCCESS -> userService.grantUser(userToGrant.get, RoleDBLabels.MODERATOR))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a username for MODERATOR")
    }
  }

  /**
    * delete a user
    * @author Benjamin Manns
    * @param username which user has to be deleted
    * @param request contains resquest headers
    * @return JSON
    */
  @RequestMapping(value = Array("users/{username}"), method = Array(RequestMethod.DELETE), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def deleteAUser(@PathVariable username: String, request: HttpServletRequest): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    val userToDelete = userService.loadUserFromDB(username)
    if (userToDelete.isEmpty) {
      throw new BadRequestException("Please provide a valid username which should be deleted")
    }
    Map("deletion" -> userService.deleteUser(userToDelete.get))
  }

  /**
    * grant a user to the global role ADMIN
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("users/grant/admin"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def grantAdmin(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val userToGrant = userService.loadUserFromDB(username)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid username to grant admin access to")
      }
      Map(LABEL_GRANT -> RoleDBLabels.ADMIN, LABEL_SUCCESS -> userService.grantUser(userToGrant.get, RoleDBLabels.ADMIN))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a username for ADMIN")
    }
  }

  /**
    * revoke a users global role
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("users/revoke"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def revokeGlobalRoleOfUser(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val userToRevoke = userService.loadUserFromDB(username)
      if (userToRevoke.isEmpty) {
        throw new BadRequestException("Please provide a valid username to revoke global role")
      }
      Map("revoke" -> userService.revokeUser(userToRevoke.get))
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a username to revoke")
    }
  }

  /**
    * revoke a users global role
    * @author Benjamin Manns
    * @param request contains resquest headers
    * @param jsonNode contains request body
    * @return JSON
    */
  @RequestMapping(value = Array("users/last_logins"), method = Array(RequestMethod.GET), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def getLastLoginsOfUsers(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): List[Map[String, Any]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid != 1) {
      throw new UnauthorizedException
    }
    try {
      val sort = jsonNode.get("sort").asText()
      loginService.getLastLoginList(sort)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a `sort` argument")
      case _: IllegalArgumentException => throw new BadRequestException("Please provide a valid sort argument: asc, desc")
    }
  }
}
