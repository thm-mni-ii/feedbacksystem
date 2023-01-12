package de.thm.ii.fbs.services.security

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.services.persistence.UserService
import de.thm.ii.fbs.util.Hash
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class LocalLoginService {
  @Autowired
  private implicit val userService: UserService = null

  /**
    * Login the user with username and password
    *
    * @param username the username of the authenticating user
    * @param password the password of the authenticating user
    */
  def login(username: String, password: String): Option[User] = {
    userService.find(username) match {
      case Some(user) =>
        var passwordHash = userService.getPassword(username).get
        if (passwordHash != null) {
          val ok = if (passwordHash.length == 40) { // Check for SHA1 Hash
            migrateSha1(user, password, passwordHash)
          } else {
            BCrypt.checkpw(password, passwordHash)
          }
          if (ok) {
            Some(user)
          } else {
            None
          }
        } else {
          None
        }
      case _ => None
    }
  }

  private def migrateSha1(user: User, password: String, passwordHash: String): Boolean =
    if (Hash.hash(password) == passwordHash) {
      upgradePassword(user, password)
      true
    } else {
      false
    }

  /**
    * Create a new user with the given password
    * @param user the user to create
    * @param password the password to create the user with
    * @return the create user
    */
  def createUser(user: User, password: String): User =
    userService.create(user, hash(password))

  /**
    * Updates the password of the given user
    * @param user the user to set the password for
    * @param newPassword the password to set
    */
  def upgradePassword(user: User, newPassword: String): Unit =
    userService.updatePasswordFor(user.id, hash(newPassword))

  private def hash(password: String): String =
    BCrypt.hashpw(password, BCrypt.gensalt())
}
