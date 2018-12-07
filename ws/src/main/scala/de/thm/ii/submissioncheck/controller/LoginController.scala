package de.thm.ii.submissioncheck.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.BadRequestException
import de.thm.ii.submissioncheck.services.{LoginService, UserService}
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
@EnableCasClient
@RequestMapping(path = Array("/api/v1"))
class LoginController extends CasClientConfigurerAdapter {
  private final val LABEL_STUDENT_ROLE = 16
  private final val application_json_value = "application/json"
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val loginService: LoginService = null
  private val logger = LoggerFactory.getLogger(this.getClass)
  /**
    * postUser sends login data to the CAS client to perform a login. Also a Cookie has to be
    * created
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @return Java Map
    */
  @RequestMapping(value = Array("login"))
  @ResponseBody
  def postUser(request: HttpServletRequest, response: HttpServletResponse): Map[String, Boolean] = {
      try {
        val principal = request.getUserPrincipal
        val name = principal.getName
        val user = userService.insertUserIfNotExists(name, LABEL_STUDENT_ROLE)
        val jwtToken = userService.generateTokenFromUser(user)
        loginService.log(user)
        response.addHeader("Authorization", "Bearer " + jwtToken)
        Map("login_result" -> true)
      } catch {
        case e: Throwable => {
          logger.error("Error: ", e)
          Map("login_result" -> false)
        }
      }
  }

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
      response.addHeader("Authorization", "Bearer " + jwtToken)
      Map("token" -> jwtToken)
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name")
      }
    }
  }
}
