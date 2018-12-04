package de.thm.ii.submissioncheck.services

import de.thm.ii.submissioncheck.misc.DB
import de.thm.ii.submissioncheck.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Interact with logged logins. Write a log, filter users
  */
@Component
class LoginService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * simply log a users login request
    * @param user logedin user
    * @return if login worked
    */
  def log(user: User): Boolean = {
    val num = DB.update("insert into login_log (user_id) VALUES (?)",
      user.userid)
    num == 1
  }

  /**
    * get a list of last login of each user
    * @author Benjamin Manns
    * @param sort: provide a sort of timestamps
    * @return Scala List of Last Login date of each existing user
    * @throws IllegalArgumentException
    */
  def getLastLoginList(sort: String): List[Map[String, Any]] = {
    if (sort != "asc" && sort != "desc") {
      throw new IllegalArgumentException("Only `asc` or `desc` are allowed")
    }
    DB.query("select user_id, username, role_id, prename, surname, email, max(`login_timestamp`) as last_login " +
      "from login_log join user using(user_id) group by user_id order by last_login " + sort,
      (res, _) => {
        Map("user_id" -> res.getString("user_id"),
        "username" -> res.getString("username"),
          "role_id" -> res.getString("role_id"),
          "prename" -> res.getString("prename"),
          "surname" -> res.getString("surname"),
          "email" -> res.getString("email"),
          "last_login" -> res.getTimestamp("last_login"))
      })
  }
}