package de.thm.ii.submissioncheck.controller

import java.util
import de.thm.ii.submissioncheck.services.UserService
import javax.servlet.http.{Cookie, HttpServletRequest, HttpServletResponse}
import org.springframework.web.bind.annotation._
import collection.JavaConverters._
// Wrapper class, performs in background a CAS Login to THM, based on
// https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
import de.thm.ii.submissioncheck.cas.CasWrapper

/**
  * LoginController simply perfoem login request. In future it might send also a COOKIE
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class LoginController {

  /** holds the communication with User Table and Authentication */
  var userService = new UserService()

  /**
    * postUser sends loginin Data to the CAS Client to perform a login. Also a Cookie has to be
    * created
    * @param response HTTP Answer (contains also cookies)
    * @param password User's password
    * @param username User's username
    * @return Java Map
    */
  @CrossOrigin
  @RequestMapping(value = Array("/login"), method = Array(RequestMethod.POST))
  @ResponseBody
  def postUser(response: HttpServletResponse, username:String, password: String ): util.Map[String, Boolean] = {
    val cas  = new CasWrapper(username,password)
    val loginResult:Boolean = cas.login()
    var jwtToken = ""
    if(loginResult)
      {
        val user = userService.insertUserIfNotExists(username,1)
        jwtToken = userService.generateTokenFromUser(user)
      }
    response.addHeader("Authorization", "Bearer " + jwtToken)
    Map("login_result" -> cas.login()).asJava
  }

}
