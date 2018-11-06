package de.thm.ii.submissioncheck.controller

import java.util
import java.util.Date
import com.sun.org.apache.xml.internal.security.algorithms.SignatureAlgorithm
import javax.servlet.http.{Cookie, HttpServletResponse}
import org.springframework.web.bind.annotation._

import collection.JavaConverters._
// Wrapper class, performs in background a CAS Login to THM, based on
// https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
import casclientwrapper.CasWrapper

/**
  * LoginController simply perfoem login request. In future it might send also a COOKIE
  *
  * @author Benjamin Manns
  */

@RestController
@RequestMapping(path = Array("/api/v1"))
class LoginController {

  /**
    * postUser sends loginin Data to the CAS Client to perform a login. Also a Cookie has to be
    * created
    * @param response HTTP Answer (contains also cookies)
    * @param password User's password
    * @param username User's username
    * @return Java Map
    */
  @RequestMapping(value = Array("/login"), method = Array(RequestMethod.POST))
  def postUser(response: HttpServletResponse, password: String, username: String): util.Map[String, Boolean] = {
    val cas  = new CasWrapper(username,password)


    // TODO Create user from service if not exists
    //Service code//Service code

    //by https://aboullaite.me/spring-boot-token-authentication-using-jwt/


    var a = new JwtResponse()



    val jwtToken = Jwts.builder.setSubject(username).claim("roles", "user").setIssuedAt(new Date()).signWith(SignatureAlgorithm.HS256, password).compact

    val myCookie = new Cookie("token" , jwtToken)

    response.addCookie(myCookie)

    Map("login_result" -> cas.login()).asJava

    // TODO if user does not exists, create it based on CAS Return
    // TODO load User into Session / Cookie, to

  }

}
