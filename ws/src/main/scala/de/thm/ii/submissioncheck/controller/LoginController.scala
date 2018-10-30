package de.thm.ii.submissioncheck.controller

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


  @RequestMapping(value = Array("/login"), method = Array(RequestMethod.POST))
  def postUser(password: String, username: String) = {
    Map("login_result" -> CasWrapper.login(username,password)).asJava


    // TODO if user does not exists, create it based on CAS Return
    // TODO load User into Session / Cookie, to
  }

}
