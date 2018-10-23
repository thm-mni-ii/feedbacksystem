package de.thm.ii.submissioncheck.controller
import org.springframework.web.bind.annotation._

import collection.JavaConverters._
import de.thm.ii.submissioncheck.services.UserService

@RestController
@RequestMapping(path = Array("/api/v1"))
class UserController {

  val userService : UserService = new UserService

  @RequestMapping(value=Array("/users"),method = Array(RequestMethod.POST))
  def postUser(username:String, password:String, prename: String, name: String, email:String) = {
    println("postUser")
    println(username)
    println(password)

    userService.addUser(prename,name,username,password,email,1)




  }

  @RequestMapping(value=Array("/users"),method = Array(RequestMethod.GET))
  def getAllUsers = {
    userService.getUsers
  }




}
