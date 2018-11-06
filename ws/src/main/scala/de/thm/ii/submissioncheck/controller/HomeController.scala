package de.thm.ii.submissioncheck.services

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.{RequestMapping, ResponseStatus}
import org.springframework.http.HttpStatus

/**
  * ResourceNotFoundException simply sends an error 404
  *
  * @author Allan Karlson
  */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ResourceNotFoundException extends RuntimeException

/**
  * HomeController serve the Angular App and force every non registered "api" route to be a error 404
  *
  * @author Allan Karlson
  */
@Controller class HomeController {

  /**
    * Return home page index page.
    * @return index page.
    */
  @RequestMapping(Array ("/"))
  def homePage: String = "index.html"

  /**
    * Handles rest api access.
    * @return Rest ressource.
    */
  @RequestMapping(value = Array("/api/**"))
  def handleRestRequests():String = throw new ResourceNotFoundException

  /**
    * Forward every access that is not defined to the index page.
    * @return Forward undefined access to index.
    */
  @RequestMapping(value = Array("/**/{[path:[^\\.]*}"))
  def redirect: String = { // Forward to home page so that route is preserved.
    "forward:/"
  }
}
