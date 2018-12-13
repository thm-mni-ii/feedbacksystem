package de.thm.ii.submissioncheck.services

import de.thm.ii.submissioncheck.misc.{DB, DateParser}
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
    * @param before: limit login log before a given date
    * @param after: limit login log after a given date
    * @param sort: provide a sort of timestamps
    * @return Scala List of Last Login date of each existing user
    * @throws IllegalArgumentException
    */
  def getLastLoginList(before: String, after: String, sort: String = "desc"): List[Map[String, Any]] = {
    var before_std = DateParser.dateParser("9999-12-31")
    var after_std = "0000-00-00"
    if (before != null) {
      before_std = DateParser.dateParser(before)
      if (before_std == null) {
        throw new IllegalArgumentException("The given `before` date is invalid.")
      }
    }
    if (after != null) {
      val after_std_date = DateParser.dateParser(after)
      if (after_std_date == null) {
        throw new IllegalArgumentException("The given `after` date is invalid.")
      }
      after_std = after_std_date.toString
    }
    var sort_subquery = ""
    if (sort != null) {
      if (sort != "asc" && sort != "desc") {
        throw new IllegalArgumentException("Only `asc` or `desc` are allowed")
      }
      sort_subquery += " order by last_login " + sort
    }
    DB.query("select * from (select user_id, username, role_id, prename, surname, email, max(`login_timestamp`) " +
      "as last_login from login_log join user using(user_id) group by user_id) sub where last_login <= ? and " +
      "last_login >= ? " + sort_subquery,
      (res, _) => {
        Map(UserDBLabels.user_id -> res.getInt(UserDBLabels.user_id),
          UserDBLabels.username -> res.getString(UserDBLabels.username),
          RoleDBLabels.role_id -> res.getInt(RoleDBLabels.role_id),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.email -> res.getString(UserDBLabels.email),
          "last_login" -> res.getTimestamp("last_login"))
      }, before_std, after_std)
  }
}
