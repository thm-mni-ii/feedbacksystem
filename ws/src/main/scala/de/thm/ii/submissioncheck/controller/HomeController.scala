package de.thm.ii.submissioncheck.services

import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.{RequestMapping, ResponseStatus}
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity


/**
  * ResourceNotFoundException simply sends an error 404
  */


@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ResourceNotFoundException extends RuntimeException {

}

/**
  * HomeController serve the Angular App and force every non registered "api" route to be a error 404
  */
@Controller class HomeController {

  @RequestMapping(Array ("/")) def homePage = "index.html"

  @RequestMapping(value = Array("/api/**"))
  def handleRestRequests():String = throw new ResourceNotFoundException

  @RequestMapping(value = Array("/**/{[path:[^\\.]*}")) def redirect: String = { // Forward to home page so that route is preserved.
    "forward:/"
  }
}