package de.thm.ii.submissioncheck.controller

import de.thm.ii.submissioncheck.services.UserService
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
  @Autowired
  private val userService: UserService = null
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
        val user = userService.insertUserIfNotExists(name, 1)
        val jwtToken = userService.generateTokenFromUser(user)

        response.addHeader("Authorization", "Bearer " + jwtToken)
        Map("login_result" -> true)
      } catch {
        case e: Throwable => {
          logger.error("Error: ", e)
          Map("login_result" -> false)
        }
      }
  }
}
