package de.thm.ii.submissioncheck.controller

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

  val userService: UserService = new UserService


  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.POST))
  def postUser(password: String, password_repeat: String, prename: String, surname: String, email: String) = {
    userService.addUser(prename, surname, password, password_repeat, email, 1)
  }

  @RequestMapping(value = Array("/users"), method = Array(RequestMethod.GET))
  def getAllUsers = {
    userService.getUsers
  }

}
