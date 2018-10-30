package de.thm.ii.submissioncheck.services

import de.thm.ii.submissioncheck.misc.ResourceNotFoundException
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping



/**
  * HomeController serve the Angular App and force every non registered "api" route to be a error 404
  * @author Benjamin Manns
  */
@Controller class HomeController {

  @RequestMapping(Array ("/")) def homePage = "index.html"

  @RequestMapping(value = Array("/api/**"))
  def handleRestRequests():String = throw new ResourceNotFoundException

  @RequestMapping(value = Array("/**/{[path:[^\\.]*}")) def redirect: String = { // Forward to home page so that route is preserved.
    "forward:/"
  }
}