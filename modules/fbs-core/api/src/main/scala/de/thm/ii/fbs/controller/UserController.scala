package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole
import de.thm.ii.fbs.security.PermissionEvaluator
import de.thm.ii.fbs.services.security.LocalLoginService
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.utils.v2.security.authorization.IsAdmin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.jdk.CollectionConverters.CollectionHasAsScala

/**
  * UserController defines all routes for /users (insert, delete, update)
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class UserController {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val loginService: LocalLoginService = null

  /**
    * Get all users of the system
    *
    * @param req http request
    * @param res http response
    * @return A list of users
    */
  @GetMapping(value = Array("users"))
  @ResponseBody
  @PreAuthorize("hasRole('MODERATOR') || @permissions.hasDocentRole()")
  def getAll(req: HttpServletRequest, res: HttpServletResponse): List[User] =
    userService.getAll(true).asScala.toList

  /**
    * Get a single user
    *
    * @param userId unique user ide
    * @param req    http request
    * @param res    http response
    * @return A single user
    */
  @GetMapping(value = Array("users/{userId}"))
  @ResponseBody
  @PreAuthorize("hasRole('MODERATOR') || @permissions.hasDocentRole() || @permissions.isSelf(#userId)")
  def getOne(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse): User =
    userService.find(userId) match {
      case u: User => u
      case _ => throw new ResourceNotFoundException()
    }

  /**
    * Update password of user
    *
    * @param userId user identification
    * @param req    http request
    * @param res    http response
    * @param body   Content
    */
  @PutMapping(value = Array("users/{userId}/passwd"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @PreAuthorize("hasRole('ADMIN') || @permissions.isSelf(#userId)")
  def updatePassword(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Unit = {
    val password = body.retrive("passwd").asText()
    val passwordRepeat = body.retrive("passwdRepeat").asText()

    if (password.isEmpty || password.get.isBlank || password != passwordRepeat) {
      throw new BadRequestException("Malformed Request Body")
    }
    loginService.upgradePassword(PermissionEvaluator.getUser, password.get)
  }

  /**
    * Update global role of user
    *
    * @param userId user identification
    * @param req    http request
    * @param res    http response
    * @param body   Content
    */
  @PutMapping(value = Array("users/{userId}/global-role"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @IsAdmin
  def updateGlobalRole(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Unit = {
    val someRoleName = body.retrive("roleName").asText()

    someRoleName match {
      case Some(roleName) => userService.updateGlobalRoleFor(userId, GlobalRole.parse(roleName))
      case None => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Create a new user
    *
    * @param req  http request
    * @param res  http response
    * @param body Content
    * @return The created user
    */
  @PostMapping(value = Array("users"), consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  @IsAdmin
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): User =
    (body.retrive("prename").asText(),
      body.retrive("surname").asText(),
      body.retrive("email").asText(),
      body.retrive("password").asText(),
      body.retrive("username").asText(),
      body.retrive("alias").asText(),
      body.retrive("globalRole").asText()
    ) match {
      case (Some(prename), Some(surname), Some(email), Some(password), Some(username), alias, globalRoleName) =>
        loginService.createUser(
          new User(prename, surname, username, globalRoleName.map(GlobalRole.parse).getOrElse(GlobalRole.USER), email, alias.orNull, null, false, false, null),
          password)
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Delete a user
    *
    * @param userId which user has to be deleted
    * @param req    http request
    * @param res    http response
    */
  @DeleteMapping(value = Array("users/{userId}"))
  @IsAdmin
  def delete(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse): Unit =
    userService.delete(userId)
}
