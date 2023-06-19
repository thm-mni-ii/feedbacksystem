package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.services.security.{AuthService, LocalLoginService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

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
  private val authService: AuthService = null
  @Autowired
  private val loginService: LocalLoginService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null

  /**
    * Get all users of the system
    * @param req http request
    * @param res http response
    * @return A list of users
    */
  @GetMapping(value = Array("users"))
  @ResponseBody
  def getAll(req: HttpServletRequest, res: HttpServletResponse): List[User] = {
    val user = authService.authorize(req, res)
    val isDocent = courseRegistrationService.getCoursePrivileges(user.getId).exists(e => e._2 == CourseRole.DOCENT)
    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || isDocent) {
      userService.getAll()
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get a single user
    * @param uid unique user ide
    * @param req http request
    * @param res http response
    * @return A single user
    */
  @GetMapping(value = Array("users/{uid}"))
  @ResponseBody
  def getOne(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): User = {
    val user = authService.authorize(req, res)
    val selfRequest = user.getId == uid
    val isDocent = courseRegistrationService.getCoursePrivileges(user.getId).exists(e => e._2 == CourseRole.DOCENT)
    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || isDocent || selfRequest) {
      userService.find(uid) match {
        case Some(u) => u
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Update password of user
    * @param uid user identification
    * @param req http request
    * @param res http response
    * @param body Content
    */
  @PutMapping(value = Array("users/{uid}/passwd"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updatePassword(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val password = body.retrive("passwd").asText()
    val passwordRepeat = body.retrive("passwdRepeat").asText()

    if (password.isEmpty || password.get.isBlank || password != passwordRepeat) {
      throw new BadRequestException("Malformed Request Body")
    }

    (user.getGlobalRole, user.getId.toInt) match {
      case (GlobalRole.ADMIN, _) | (_, `uid`) =>
        loginService.upgradePassword(user, password.get)
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Update global role of user
    * @param uid user identification
    * @param req http request
    * @param res http response
    * @param body Content
    */
  @PutMapping(value = Array("users/{uid}/global-role"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updateGlobalRole(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val someRoleName = body.retrive("roleName").asText()

    (user.getGlobalRole, someRoleName) match {
      case (GlobalRole.ADMIN, Some(roleName)) =>
        userService.updateGlobalRoleFor(uid, GlobalRole.parse(roleName))
      case (GlobalRole.ADMIN, None) => throw new BadRequestException("Malformed Request Body")
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Create a new user
    * @param req http request
    * @param res http response
    * @param body Content
    * @return The created user
    */
  @PostMapping(value = Array("users"), consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): User = {
    val user = authService.authorize(req, res)
    if (user.getGlobalRole != GlobalRole.ADMIN) {
      throw new ForbiddenException()
    }
    ( body.retrive("prename").asText(),
      body.retrive("surname").asText(),
      body.retrive("email").asText(),
      body.retrive("password").asText(),
      body.retrive("username").asText(),
      body.retrive("alias").asText(),
      body.retrive("globalRole").asText()
    ) match {
      case (Some(prename), Some(surname), Some(email), Some(password), Some(username), alias, globalRoleName) =>
        loginService.createUser(
          new User(prename, surname, username, globalRoleName.map(GlobalRole.parse).getOrElse(GlobalRole.USER), email, alias.orNull, null),
          password)
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Delete a user
    * @param uid which user has to be deleted
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("users/{uid}"))
  def delete(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit =
    authService.authorize(req, res).getGlobalRole match {
      case GlobalRole.ADMIN => userService.delete(uid)
      case _ => throw new ForbiddenException()
    }
}
