package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.UnauthorizedException
import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.services.persistence.UserService
import de.thm.ii.fbs.services.security.{AuthService, LocalLoginService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.util.LDAPConnector

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
  @Value("${cas.client-host-url}")
  private val CLIENT_HOST_URL: String = null
  @Value("${ldap.url}")
  private implicit val LDAP_URL: String = null
  @Value("${ldap.basedn}")
  private implicit val LDAP_BASE_DN: String = null

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
    LDAPConnector.loadLDAPInfosByUID(uid)(LDAP_URL, LDAP_BASE_DN)
      .map(entry => new User(
      entry.getAttribute("givenName").getStringValue,
      entry.getAttribute("sn").getStringValue,
      entry.getAttribute("mail").getStringValue,
      entry.getAttribute("uid").getStringValue,
      GlobalRole.USER))

  /**
    * Login via LDAP
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @RequestMapping(value = Array("/ldap"), method = Array(RequestMethod.POST))
  def userLDAPLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val login = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
      ldapUser <- LDAPConnector.loginLDAPUserByUIDAndPassword(username, password)(LDAP_URL, LDAP_BASE_DN)
      user <- loadUserFromLdap(ldapUser.getAttribute("uid").getStringValue)
    } yield (user, password)

    login match {
      case Some((user, password)) =>
        val localUser = userService.find(user.username).getOrElse(userService.create(user, password))
        authService.renewAuthentication(localUser, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Login via local database.
    * @param request Http request gives access to the http request information.
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
