package de.thm.ii.submissioncheck.controller

import java.util
import org.springframework.web.bind.annotation._
import de.thm.ii.submissioncheck.services.UserService

/**
  * UserController defines all routes for /users (insert, delete, update). So far only a few
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class UserController {
  /** userService instance to handle DB Connection */
  val userService: UserService = new UserService()

  /**
    * getAllUsers is a admin function und just sends a list of all users
    *
    * @author Benjamin Manns
    * @return JSON of all Users
    */
  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.GET))
  def getAllUsers: util.List[util.Map[String, String]] = {
    userService.getUsers
  }
}
