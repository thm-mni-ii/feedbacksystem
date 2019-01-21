package de.thm.ii.submissioncheck.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
import de.thm.ii.submissioncheck.services.{LoginService, SettingService, UserService}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import net.unicon.cas.client.configuration.{CasClientConfigurerAdapter, EnableCasClient}
import org.springframework.web.bind.annotation._
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired

/**
  * LoginController simply perfoem login request. In future it might send also a COOKIE
  *
  * @author Benjamin Manns
  */
@RestController
//@EnableCasClient
@RequestMapping(path = Array("/api/v1"))
class LoginController extends CasClientConfigurerAdapter {
  private final val LABEL_STUDENT_ROLE = 16
  private final val application_json_value = "application/json"
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val settingService: SettingService = null
  @Autowired
  private val loginService: LoginService = null
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val LABEL_LOGIN_RESULT = "login_result"
  private val LABEL_SHOW_PRIVACY = "show_privacy"
  private val LABEL_AUTHORIZATION = "Authorization"
  private val LABEL_SUCCESS = "success"
  private val LABEL_USERNAME = "username"
  /**
    * Authentication starts here. Until now without CAS, should be then with LDAP
    *
    *
    * This Webservice sends user to CAS to perform a login. CAS redirects to this point and
    * here a answer to a connected Application (i.e. Angular) will be sent
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    * @return Java Map
    */
  @RequestMapping(value = Array("login"), method = Array(RequestMethod.POST))
  def userLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      val password = jsonNode.get("password").asText()

      // TODO perform login with LDAP
      val user = userService.loadUserFromDB(username)
      val login: Boolean = user.isDefined

      val jwtToken: String = if (login) this.userService.generateTokenFromUser(user.get) else null

      setBearer(response, jwtToken)
      Map(LABEL_SUCCESS -> login)
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username and password")
      }
    }
  }

  private def setBearer(response: HttpServletResponse, token: String) = response.addHeader(LABEL_AUTHORIZATION, "Bearer " + token)

  /**
    * check if user has to accept privacy first
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body contains json
    * @return simple answer if user need to accept privacy policy
    */
  @RequestMapping(value = Array("login/privacy/check"), method = Array(RequestMethod.POST))
  def checkUsersPrivacyAcceptance(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val username = jsonNode.get(LABEL_USERNAME).asText()
      Map(LABEL_SUCCESS -> userService.loadUserFromDB(username).isDefined)
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: username")
      }
    }
  }

  /**
    * If a user is not registered yet, he may has to accept the provacy message, this is done here, after accepting,
    * he will be registered into db
    * @author Benjamin Manns
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */

  /**
    * Provide a REST for getting fast a token, only for testing purpose
    * @author Benjamin Manns
    * @param request contain request information
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @deprecated("0", "Don't use this in production")
  @RequestMapping(value = Array("login/token"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def createToken(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Map[String, String] = {
    try {
      val name = jsonNode.get("name").asText()
      val user = this.userService.insertUserIfNotExists(name, LABEL_STUDENT_ROLE)
      loginService.log(user)
      val jwtToken = this.userService.generateTokenFromUser(user)
      setBearer(response, jwtToken)
      Map("token" -> jwtToken)
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name")
      }
    }
  }
}
