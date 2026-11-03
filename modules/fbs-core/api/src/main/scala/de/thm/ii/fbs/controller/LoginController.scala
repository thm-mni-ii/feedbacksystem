package de.thm.ii.fbs.controller

import tools.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{ForbiddenException, UnauthorizedException}
import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.services.persistence.UserService
import de.thm.ii.fbs.services.security.{AuthService, LdapService, LocalLoginService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper

import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.web.bind.annotation._

/**
  * LoginController simply perform login request.
  * @deprecated Delegated to fbs-identity-service
  */
@RestController
@RequestMapping(path = Array("/api/v1/login"))
@deprecated("Authentication is delegated to fbs-identity-service", "2.0.0")
class LoginController {
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val loginService: LocalLoginService = null
  @Autowired
  private val ldapService: LdapService = null

  @Value("${ldap.attributeNames.uid}")
  private val uidAttributeName: String = null
  @Value("${ldap.attributeNames.sn}")
  private val snAttributeName: String = null
  @Value("${ldap.attributeNames.name}")
  private val nameAttributeName: String = null
  @Value("${ldap.attributeNames.mail}")
  private val mailAttributeName: String = null
  @Value("${ldap.allowLogin}")
  private val allowLdapLogin: Boolean = false

  private def loadUserFromLdap(uid: String): Option[User] =
    ldapService.getEntryByUid(uid)
      .map(entry => new User(
      entry.getAttribute(nameAttributeName).getStringValue,
      entry.getAttribute(snAttributeName).getStringValue,
      entry.getAttribute(mailAttributeName).getStringValue,
      entry.getAttribute(uidAttributeName).getStringValue,
      GlobalRole.USER))

  /**
    * Login via LDAP
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @deprecated("Use fbs-identity-service OIDC flow", "2.0.0")
  @RequestMapping(value = Array("/ldap"), method = Array(RequestMethod.POST))
  def userLDAPLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    if (allowLdapLogin) {
      val login = for {
        username <- jsonNode.retrive("username").asText()
        password <- jsonNode.retrive("password").asText()
        ldapUser <- ldapService.login(username, password)
        user <- loadUserFromLdap(ldapUser.getAttribute("uid").getStringValue)
      } yield user

      login match {
        case Some((user)) =>
          val localUser = userService.find(user.username).getOrElse(userService.create(user, null))
          authService.renewAuthentication(localUser, response)
        case None => throw new UnauthorizedException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Login via local database.
    *
    * @param request  Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @deprecated("Use fbs-identity-service OIDC flow", "2.0.0")
  @RequestMapping(value = Array("/local"), method = Array(RequestMethod.POST))
  def userLocalLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val login = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
      user <- loginService.login(username, password)
    } yield user

    login match {
      case Some(user) => authService.renewAuthentication(user, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Login via local database or ldap.
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @deprecated("Use fbs-identity-service OIDC flow", "2.0.0")
  @RequestMapping(value = Array("/unified"), method = Array(RequestMethod.POST))
  def userUnifiedLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val credentials = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
    } yield (username, password)

    val user = credentials.flatMap(creds =>
        loginService.login(creds._1, creds._2).orElse(if (allowLdapLogin) {for {
            ldapLogin <- ldapService.login(creds._1, creds._2)
            ldapUser <- loadUserFromLdap(ldapLogin.getAttribute(uidAttributeName).getStringValue)
              .map(user => userService.find(user.username).getOrElse(userService.create(user, null)))
          } yield ldapUser} else {None})
    )

    user match {
      case Some(user) => authService.renewAuthentication(user, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Renews the token of the user
    * @param req Http Request
    * @param res Http Response
    */
  @RequestMapping(value = Array("/token"), method = Array(RequestMethod.GET))
  def renew(req: HttpServletRequest, res: HttpServletResponse): Unit = {
    authService.authorize(req, res);
  }
}
