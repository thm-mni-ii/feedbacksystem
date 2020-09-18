package de.thm.ii.fbs.controller

import de.thm.ii.fbs.util.ResourceNotFoundException
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
  * HomeController serve the Angular App and force every non registered "api" route to be a error 404
  *
  * @author Allan Karlson
  */
@Controller
class HomeController {
  /**
    * Return home page index page.
    * @return index page.
    */
  @RequestMapping(Array ("/"))
  def homePage: String = "index.html"

  /**
    * Return login index page.
    * @return index page.
    */
  @RequestMapping(Array ("/login"))
  def loginPage: String = "forward:/"

  /**
    * Handles rest api access.
    * @return Rest ressource.
    */
  @RequestMapping(value = Array("/api/**"))
  def handleRestRequests(): String = throw new ResourceNotFoundException

  /**
    * Forward every access that is not defined to the index page.
    * @return Forward undefined access to index.
    */
  @RequestMapping(value = Array("/{head:[^w][^e][^b].*}/**/{tail:[^\\.]*}"))
  def redirect: String = "forward:/"
}
