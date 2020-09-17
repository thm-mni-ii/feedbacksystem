package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, UnauthorizedException}
import de.thm.ii.fbs.model.{User, GlobalRole}

import de.thm.ii.fbs.services.persistance.{CourseService, UserService}
import de.thm.ii.fbs.services.security.{AuthService}
import de.thm.ii.fbs.util.LDAPConnector
import javax.servlet.http.{Cookie, HttpServletRequest, HttpServletResponse}
import net.unicon.cas.client.configuration.{CasClientConfigurerAdapter, EnableCasClient}
import org.ldaptive.LdapEntry
import org.springframework.web.bind.annotation._
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}

/**
  * LoginController simply perform login request. In future it might send also a COOKIE
  */
@RestController
@EnableCasClient
@RequestMapping(path = Array("/api/v1/login"))
class LoginController extends CasClientConfigurerAdapter {
  private final val LABEL_STUDENT_ROLE = 16
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val courseService: CourseService = null
  @Value("${cas.client-host-url}")
  private val CLIENT_HOST_URL: String = null
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val LABEL_AUTHORIZATION = "Authorization"
  private val LABEL_SUCCESS = "success"
  private val LABEL_USERNAME = "username"

  @Value("${ldap.url}")
  private implicit val LDAP_URL: String = null

  @Value("${ldap.basedn}")
  private implicit val LDAP_BASE_DN: String = null

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
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def userLogin(@RequestParam(value = "route", required = false) route: String, request: HttpServletRequest, response: HttpServletResponse): Any = {
    try {
      val casUser = request.getUserPrincipal

      var name: String = null
      if (casUser == null) {
        logger.warn("HELP WE GOT NO ANSWER FOM CAS")
      } else {
        name = casUser.getName
      }
      var user = userService.find(name)
      if (user.isEmpty) {
        val entry = LDAPConnector.loadLDAPInfosByUID(name)(LDAP_URL, LDAP_BASE_DN)
        userService.create(new User(
          entry.getAttribute("uid").getStringValue,
          entry.getAttribute("mail").getStringValue,
          entry.getAttribute("givenName").getStringValue,
          entry.getAttribute("sn").getStringValue,
          GlobalRole.USER), "")
          user = userService.find(name)
      }
     authService.renewAuthentication(user.get, response)
      "jwt"
    } catch {
      case e: Throwable => {
        logger.error("Error: ", e)
        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY)
        response.setHeader("Location", CLIENT_HOST_URL + "/")
        "error"
      }
    }}

  /**
    * Authentication starts here. We can load data directly from LDAP. Until now this is not possible
    *
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    * @return Java Map
    */
  @RequestMapping(value = Array("/ldap"), method = Array(RequestMethod.POST))
  def userLDAPLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    var ldapUser: Option[LdapEntry] = None
    var username: String = null
    var password: String = null
    try {
      username = jsonNode.get(LABEL_USERNAME).asText()
      password = jsonNode.get("password").asText()
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username and password")
      }
    }

    try {
      ldapUser = LDAPConnector.loginLDAPUserByUIDAndPassword(username, password)(LDAP_URL, LDAP_BASE_DN)
    } catch {
      case _: Exception => ldapUser = None
    }

    val login: Boolean = ldapUser.isDefined
    if (!login) {
      // If LDAP Fails, we try to load from guest account
      val guestUser = userService.guestLogin(username, password)
      val jwtToken: String = if (guestUser.isDefined) this.userService.generateTokenFromUser(guestUser.get) else null
      setBearer(response, jwtToken)
      Map(LABEL_SUCCESS -> guestUser.isDefined)
    } else {
      userService.insertUserIfNotExists(ldapUser.get.getAttribute("uid").getStringValue, ldapUser.get.getAttribute("mail").getStringValue,
        ldapUser.get.getAttribute("givenName").getStringValue, ldapUser.get.getAttribute("sn").getStringValue, LABEL_STUDENT_ROLE)

      val user = userService.find(username)
      if (user.isEmpty) {
        throw new UnauthorizedException("Problem finding user, missmatch with LDAP result ")
      }

      val jwtToken: String = this.userService.generateTokenFromUser(user.get)
      setBearer(response, jwtToken)
      Map(LABEL_SUCCESS -> true)
    }
  }

  private def setBearer(response: HttpServletResponse, token: String) = response.addHeader(LABEL_AUTHORIZATION, "Bearer " + token)

  /**
    * Give information if user is already successful loged in
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @return JSON if user is logged in
    */
  @RequestMapping(value = Array("/check"), method = Array(RequestMethod.POST))
  def checkIfUsersIsLogedIn(request: HttpServletRequest, response: HttpServletResponse): Map[String, Boolean] = {
    Users.claimAuthorization(request)
    Map(LABEL_SUCCESS -> true)
  }

  /**
    * User can accept the privacy policy
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body contains json
    * @return JSON if update worked out
    * @return
    */
  @RequestMapping(value = Array("/privacy/accept"), method = Array(RequestMethod.POST))
  def privacyAcceptanceOfUser(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      Map(LABEL_SUCCESS -> userService.acceptPrivacyForUser(username))
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username")
      }
    }
  }

  /**
    * check if user has to accept privacy first
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body contains json
    * @return simple answer if user need to accept privacy policy
    */
  @PostMapping(value = Array("/privacy/check"))
  def checkUsersPrivacyAcceptance(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val settingsPrivacyShow = settingService.loadSetting("privacy.show")
      val show = if (settingsPrivacyShow.isDefined) settingsPrivacyShow.get.asInstanceOf[Boolean] else true

      if (!show) {
        Map(LABEL_SUCCESS -> true)
      } else {
        val username = jsonNode.get(LABEL_USERNAME).asText()
        val user = userService.find(username)
        if(user.isEmpty) {
          Map(LABEL_SUCCESS -> false)
        } else {
          Map(LABEL_SUCCESS -> user.get.privacy_checked)
        }
      }
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username")
      }
    }
  }
}
