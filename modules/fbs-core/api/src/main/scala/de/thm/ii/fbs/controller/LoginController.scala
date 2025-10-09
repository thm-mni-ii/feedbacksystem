package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{ForbiddenException, UnauthorizedException}
import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.services.persistence.UserService
import de.thm.ii.fbs.services.security.{AuthService, LdapService, LocalLoginService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper

import javax.servlet.http.{Cookie, HttpServletRequest, HttpServletResponse}
import net.unicon.cas.client.configuration.{CasClientConfigurerAdapter, EnableCasClient}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.web.bind.annotation._

/**
  * LoginController simply perform login request.
  */
@RestController
@EnableCasClient
@RequestMapping(path = Array("/api/v1/login"))
class LoginController extends CasClientConfigurerAdapter {
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val loginService: LocalLoginService = null
  @Autowired
  private val ldapService: LdapService = null

  @Value("${cas.client-host-url}")
  private val CLIENT_HOST_URL: String = null
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

  private val logger = LoggerFactory.getLogger(this.getClass)
  /**
    * Authentication starts here. here we using CAS
    *
    *
    * This Webservice sends user to CAS to perform a login. CAS redirects to this point and
    * here a answer to a connected Application (i.e. Angular) will be sent
    *
    * @author Benjamin Manns
    * @param route requested route by user, has to be forwarded to the Angular App
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @return Java Map
    */
  @RequestMapping(value = Array("/cas"), method = Array(RequestMethod.GET))
  def userLogin(@RequestParam(value = "route", required = false) route: String, request: HttpServletRequest,
                response: HttpServletResponse): Unit = {
    try {
      val casUser = request.getUserPrincipal

      var name: String = null
      if (casUser == null) {
        logger.warn("HELP WE GOT NO ANSWER FOM CAS")
      } else {
        name = casUser.getName
      }
      userService.find(name)
        .orElse(loadUserFromLdap(name).map(u => userService.create(u, null)))
        .foreach(u => {
          val token = authService.createToken(u)
          userService.updateLastLogin(u.id)
          val co = new Cookie("jwt", token)
          co.setPath("/")
          co.setHttpOnly(false)
          co.setMaxAge(30)
          response.addCookie(co)
          val cr = new Cookie("JSESSIONID", "")
          cr.setPath("/")
          cr.setHttpOnly(true)
          cr.setSecure(true)
          cr.setMaxAge(0)
          response.addCookie(cr)
        })

      response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY)
      response.setHeader("Location", CLIENT_HOST_URL + "/courses")
    } catch {
      case e: Throwable => {
        logger.error("Error: ", e)
        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY)
        response.setHeader("Location", CLIENT_HOST_URL + "/")
      }
    }}

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
          authService.newAuthentication(localUser, response)
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
  @RequestMapping(value = Array("/local"), method = Array(RequestMethod.POST))
  def userLocalLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val login = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
      user <- loginService.login(username, password)
    } yield user

    login match {
      case Some(user) => authService.newAuthentication(user, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Login via local database or ldap.
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
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
      case Some(user) => authService.newAuthentication(user, response)
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
