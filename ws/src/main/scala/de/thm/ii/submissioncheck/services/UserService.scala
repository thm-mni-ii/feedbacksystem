package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet, Statement}
import java.util
import de.thm.ii.submissioncheck.config.MySQLConfig
import de.thm.ii.submissioncheck.misc.BadRequestException
import collection.JavaConverters._
import scala.collection.mutable.ListBuffer

/**
  * UserService serves all user data in both directions using mysql
  *
  * @author Benjamin Manns
  */
class UserService {

  /** mysqlConnector establish connection to our mysql 8 DB */
  val mysqlConnector: Connection = new MySQLConfig().getConnector

  /**
    * getUsers is a admin function und just sends a list of all users
    *
    * @author Benjamin Manns
    * @return JSON (Map) of all current users with no restrictions so far (not printing passwords)
    */
  def getUsers: util.List[util.Map[String, String]] = {
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT * FROM db1.users")
    val resultSet = prparStmt.executeQuery()
    var userList = new ListBuffer[java.util.Map[String, String]]()

    val resultIterator = new Iterator[ResultSet] {
      def hasNext: Boolean = resultSet.next()

      def next(): ResultSet = resultSet
    }.toStream

    for (res <- resultIterator.iterator) {
      userList += Map("userid" -> res.getString("userid"),
        "prename" -> res.getString("prename"),
        "surname" -> res.getString("surname"),
        "roleid" -> res.getString("roleid"),
        "email" -> res.getString("email")).asJava
    }

    userList.toList.asJava
  }

  /**
    * addUser inserts a new User to DB
    *
    * @author Benjamin Manns
    * @param prename         User's prename
    * @param surname         User's surname
    * @param password_clear  User's password
    * @param password_repeat User's repeated password
    * @param email           User's email address
    * @param roleId          Users's role id
    * @return Java Map
    */
  def addUser(prename: String, surname: String, password_clear: String, password_repeat: String, email: String, roleId: Int = 1): util.Map[String, Int] = {

    if (prename == "" || surname == "" || password_clear == "" || password_repeat == "" || email == "") {
      throw new BadRequestException("Empty fields not allowed. Make sure to apply all post fields of: " +
        "prename, surname, username, password, password_repeat, email")
    }

    if (password_clear != password_repeat) {
      throw new BadRequestException("passwords mismatch")
    }

    val md = java.security.MessageDigest.getInstance("SHA-1")
    val passwordCrypt = md.digest(password_clear.getBytes("UTF-8")).map("%02x".format(_)).mkString

    // TODO check email format
    val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO users " +
      "(prename, surname, password, email, roleid) VALUES (?,?,?,?,?);", Statement.RETURN_GENERATED_KEYS)

    // scala doc checker fix
    val param4: Int = 4
    val param5: Int = 5
    prparStmt.setString(1, prename)
    prparStmt.setString(2, surname)
    prparStmt.setString(3, passwordCrypt)
    prparStmt.setString(param4, email)
    prparStmt.setInt(param5, roleId)
    prparStmt.execute()

    var insertedID = -1
    val rs = prparStmt.getGeneratedKeys
    if (rs.next) insertedID = rs.getInt(1)

    if (insertedID == -1) {
      throw new RuntimeException("Error creating user. Please contact administrator.")
    }

    Map("new_userid" -> insertedID).asJava

  }

}
