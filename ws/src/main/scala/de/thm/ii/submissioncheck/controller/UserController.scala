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
  val userService: UserService = new UserService

  /**
    * postUser create a user based on the requested data
    *
    * @author Benjamin Manns
    * @param password User's password
    * @param password_repeat User's password
    * @param prename User's prename
    * @param surname User's surname
    * @param email User's email
    * @return JSON contains New created UserId
    */
  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.POST))
  def postUser(password: String, password_repeat: String, prename: String, surname: String, email: String): util.Map[String, Int] = {
    userService.addUser(prename, surname, password, password_repeat, email, 1)
  }

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
