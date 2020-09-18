package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.services.UserService
import javax.servlet.http.HttpServletRequest

/**
  * Helpers to authorize users.
  *
  * @author Andrej Sajenko
  */
object Users {
  /**
    * Authorize a user and return it.
    * @param request Http Server request
    * @param userService User service
    * @return A user
    */
  def claimAuthorization(request: HttpServletRequest)(implicit userService: UserService): User = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    user.get
  }

  /**
    * Authorize a user and return it.
    * @param token The jwt token
    * @param userService User service
    * @return A user
    */
  def claimAuthorization(token: String)(implicit userService: UserService): User = {
    val user = userService.verifyUserByTocken(token)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    user.get
  }
}
