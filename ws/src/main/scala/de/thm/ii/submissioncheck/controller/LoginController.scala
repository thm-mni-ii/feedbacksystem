package de.thm.ii.submissioncheck.controller

import java.util
import de.thm.ii.submissioncheck.cas.CasWrapper
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
    * @param password User's password
    * @param username User's username
    * @return Java Map
    */
  @RequestMapping(value = Array("/login"), method = Array(RequestMethod.POST))
  def postUser(password: String, username: String): util.Map[String, Boolean] = {
    val cas  = new CasWrapper(username,password)
    Map("login_result" -> cas.login()).asJava

    // TODO if user does not exists, create it based on CAS Return
    // TODO load User into Session / Cookie, to
  }

}
