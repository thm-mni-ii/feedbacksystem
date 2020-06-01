package de.thm.ii.fbs.services

import java.sql.Timestamp

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.util.{DB, DateParser}
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
    1 == DB.update("insert into login_log (user_id) VALUES (?)", user.userid)
  }

  /**
    * get a list of last login of each user
    * @author Benjamin Manns
    * @param before: limit login log before a given date
    * @param after: limit login log after a given date
    * @param sort: provide a sort of timestamps
    * @param showDeleted filter user on deleted status
    * @return Scala List of Last Login date of each existing user
    * @throws IllegalArgumentException
    */
  def getLastLoginList(before: String, after: String, sort: String = "desc", showDeleted: Boolean): List[Map[String, Any]] = {
    val deletedUserSubQuery = if (showDeleted) "" else " AND status = 1"

    var listAll = true
    var before_std = DateParser.dateParser("9999-12-31 00:00:00")
    var after_std = "0001-01-01 00:00:00"
    if (before != null) {
      listAll = false
      before_std = DateParser.dateParser(before)
      if (before_std == null) {
        throw new IllegalArgumentException("The given `before` date is invalid.")
      }
    }
    if (after != null) {
      listAll = false
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
      "last_login >= ? " + (if (listAll) { " UNION\nselect user_id, username, role_id, prename, surname, email, " +
      "NULL as login_timestamp from user where user_id NOT IN (SELECT DISTINCT user_id from login_log) " + deletedUserSubQuery} else {" "})
      + sort_subquery,
      (res, _) => {
        Map(UserDBLabels.user_id -> res.getInt(UserDBLabels.user_id),
          UserDBLabels.username -> res.getString(UserDBLabels.username),
          RoleDBLabels.role_id -> res.getInt(RoleDBLabels.role_id),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.email -> res.getString(UserDBLabels.email),
          "last_login" -> nullSafeTime(res.getTimestamp("last_login")))
      }, before_std, after_std)
  }

  private def nullSafeTime(t: Timestamp): java.lang.Long = if (t == null) null else t.getTime
}
