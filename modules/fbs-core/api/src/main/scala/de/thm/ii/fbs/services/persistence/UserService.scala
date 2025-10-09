package de.thm.ii.fbs.services.persistence

import java.math.BigInteger
import java.sql.{Date, ResultSet, SQLException}
import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.util.{DB, Hash}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Handles the creation, deletion and modifications of user persistant state.
  */
@Component
class UserService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all stored users
    * @param ignoreDeleted Ignores deleted users
    * @return List of users
    */
  def getAll(ignoreDeleted: Boolean = true): List[User] =
    DB.query("SELECT user_id, prename, surname, email, username, alias, global_role FROM user"
      + (if (ignoreDeleted)  " where deleted = 0" else ""), (res, _) => parseResult(res))

  /**
   * Get all stored users
   * @param ignoreDeleted Ignores deleted users
   * @return List of users
   */
  def getUsersWithLastLoginBefore(before: Date, ignoreDeleted: Boolean = true): List[User] =
    DB.query("SELECT user_id, prename, surname, email, username, alias, global_role FROM user WHERE last_login < ?"
      + (if (ignoreDeleted)  " and deleted = 0" else ""), (res, _) => parseResult(res), before)

  /**
    * Find the first user by id
    * @param id The users id
    * @return The found user
    */
  def find(id: Int): Option[User] =
    DB.query("SELECT user_id, prename, surname, email, username, alias, global_role FROM user where user_id = ?", (res, _) =>
      parseResult(res), id).headOption

  /**
    * Find the first user by username
    * @param username username
    * @return The found user
    */
  def find(username: String): Option[User] =
    DB.query("SELECT user_id, prename, surname, email, username, alias, global_role FROM user where username = ?", (res, _) =>
      parseResult(res), username).headOption

  /**
    * Create a new user.
    * @param user The new user
    * @param password The users password (nullable)
    * @return The created user object
    */
  def create(user: User, password: String): User = {
    DB.insert("INSERT INTO user (prename, surname, email, username, alias, global_role, password) VALUES (?,?,?,?,?,?,?);",
      user.prename, user.surname, user.email, user.username, user.alias.orNull, user.globalRole.id, password)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => find(id)) match {
      case Some(user) => user
      case None => throw new SQLException("User could not be created")
    }
  }

  /**
    * Update the password of the user with id
    * @param id The users id
    * @param password The new password (nullable)
    * @return True if successfully updated
    */
  def updatePasswordFor(id: Int, password: String): Boolean =
    1 == DB.update("UPDATE user set password = ? WHERE user_id = ?;", password, id)

  /**
    * Update the global role of a user with id
    * @param id The users id
    * @param globalRole The new global role
    * @return True if successfully updated
    */
  def updateGlobalRoleFor(id: Int, globalRole: GlobalRole.Value): Boolean =
    1 == DB.update("UPDATE user set global_role = ? WHERE user_id = ?", globalRole.id, id)

  /**
    * Update the privacy check if the user.
    * The privacy check signal the users agreement to the privacy text of the software.
    * @param id The users id
    * @param agreed His agreement
    * @return True if successfully updated
    */
  def updateAgreementToPrivacyFor(id: Int, agreed: Boolean): Boolean = {
    1 == DB.update("UPDATE user SET privacy_checked = ? where user_id = ?", if (agreed) 1 else 0, id)
  }

  /**
    * Get the user agreement for the systems privacy text.
    * @param uid The user id
    * @return True if the user agreed to the privacy text, false in any other case.
    */
  def getPrivacyStatusOf(uid: Int): Boolean =
    DB.query("SELECT privacy_checked FROM user WHERE user_id = ?", (res, _) =>
      res.getBoolean("privacy_checked"), uid).headOption.getOrElse(false)

  /**
    * Delete a user from the system, by replacing its personalized information with markers.
    * @param id The user id.
    * @return True if successfully updated
    */
  def delete(id: Int): Boolean = {
    DB.update("DELETE FROM user_course WHERE user_id = ?", id)
    1 == DB.update("UPDATE user SET prename = 'Deleted User', surname = 'Deleted User', " +
    "username = 'duser " + id + "', email = '' WHERE user_id = ?", id)
  }

  /**
   * Sets the last_login of the user to now
   * @param id The user id.
   * @return True if successfully updated
   */
  def updateLastLogin(id: Int): Boolean =
    DB.update("UPDATE user SET last_login = now() WHERE user_id = ?", id) == 1

  /**
    * Get the password for the user with the given username
    * @param username the username of the user to get the password for
    */
  def getPassword(username: String): Option[String] = DB.query("SELECT password FROM user WHERE username = ?",
    (res, _) => res.getString("password"), username).headOption

  private def parseResult(res: ResultSet): User = new User(
    prename = res.getString("prename"),
    surname = res.getString("surname"),
    email = res.getString("email"),
    username = res.getString("username"),
    globalRole = GlobalRole.parse(res.getInt("global_role")),
    alias = Option(res.getString("alias")),
    lastLogin = Option(res.getDate("last_login")),
    id = res.getInt("user_id")
  )
}
