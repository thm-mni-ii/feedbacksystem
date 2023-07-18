package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.utils.v2.security.authorization.PermitAll
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
  * HomeController serve the Angular App and force every non registered "api" route to be an 404 error
  */
@Controller
class HomeController {
  /**
    * Return home page index page.
    * @return index page.
    */
  @PermitAll
  @RequestMapping(Array ("/"))
  def homePage: String = "index.html"

  /**
    * Return login index page.
    * @return index page.
    */
  @PermitAll
  @RequestMapping(Array ("/login"))
  def loginPage: String = "forward:/"

  /**
    * Return go index page.
    * @return index page.
    */
  @PermitAll
  @RequestMapping(Array ("/go/**"))
  def goPage: String = "forward:/"

  /**
    * Handles rest api access.
    * @return Rest ressource.
    */
  @PermitAll
  @RequestMapping(value = Array("/api/**"))
  def handleRestRequests(): String = throw new ResourceNotFoundException

  /**
    * Forward every access that is not defined to the index page.
    * @return Forward undefined access to index.
    */
  @PermitAll
  @RequestMapping(value = Array("/courses", "/sqlplayground", "/analytics")) // TODO: Remove as soon as possible
  def redirectRoot: String = "forward:/"

  /**
    * Forward every access that is not defined to the index page.
    * @return Forward undefined access to index.
    */
  @PermitAll
  @RequestMapping(value = Array("/{head:[^w][^e][^b].*}/**/{tail:[^\\.]*}"))
  def redirect: String = "forward:/"
}
