package de.thm.ii.submissioncheck.services

import java.sql.{Connection, Statement}

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


  val mysqlConnector: Connection = new MySQLConfig().getConnector


  /**
    * getUsers
    *
    * @return JSON (Map) of all current users with no restrictions so far (not printing passwords)
    */
  def getUsers = {

    val prparStmt = this.mysqlConnector.prepareStatement("SELECT * FROM db1.users")
    val resultSet = prparStmt.executeQuery()
    var userList = new ListBuffer[java.util.Map[String, String]]()

    while (resultSet.next) {
      userList += Map("userid" -> resultSet.getString("userid"), "prename" -> resultSet.getString("prename"),
        "surname" -> resultSet.getString("prename"), "roleid" -> resultSet.getString("roleid"),
        "email" -> resultSet.getString("email")).asJava
    }

    userList.toList.asJava
  }

  /**
    * addUser inserts a new User to DB
    *
    * @param prename         User's prename
    * @param surname         User's surname
    * @param password_clear  User's password
    * @param password_repeat User's repeated password
    * @param email           User's email address
    * @param roleId          Users's role id
    * @return
    */
  def addUser(prename: String, surname: String, password_clear: String, password_repeat: String, email: String, roleId: Int = 1) = {

    /*  println(prename)
      println(surname)
      println(password_clear)
      println(password_repeat)
      println(email)*/

    if (prename == "" || surname == "" || password_clear == "" || password_repeat == "" || email == "" || prename == null || surname == null || password_clear == null || password_repeat == null) {
      throw new BadRequestException("Empty fields not allowed. Make sure to apply all post fields of: prename, surname, username, password, password_repeat, email")
    }

    if (password_clear != password_repeat) {

      throw new BadRequestException("passwords mismatch")
    }

    val md = java.security.MessageDigest.getInstance("SHA-1")
    val passwordCrypt = md.digest(password_clear.getBytes("UTF-8")).map("%02x".format(_)).mkString

    // TODO check email format

    val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO users (prename, surname, password, email, roleid) VALUES (?,?,?,?,?);", Statement.RETURN_GENERATED_KEYS)

    prparStmt.setString(1, prename)
    prparStmt.setString(2, surname)
    prparStmt.setString(3, passwordCrypt)
    prparStmt.setString(4, email)
    prparStmt.setInt(5, roleId)

    prparStmt.execute()

    var insertedID = -1
    val rs = prparStmt.getGeneratedKeys
    if (rs.next) insertedID = rs.getInt(1)

    println(insertedID)
    if (insertedID == -1) {
      throw new RuntimeException("Error creating user. Please contact administrator.")
    }


    Map("userid" -> insertedID).asJava


  }


}
