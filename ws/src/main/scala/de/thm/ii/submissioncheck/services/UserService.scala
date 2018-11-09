package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet, Statement}
import java.util
import java.util.Date
import de.thm.ii.submissioncheck.config.MySQLConfig
import de.thm.ii.submissioncheck.misc.BadRequestException
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import javax.xml.bind.DatatypeConverter
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
    * Class holds all DB labels
    */
  class DBLabels{
    /** DB Label "userid" */
    var userid: String = "userid"

    /** DB Label "username" */
    var username: String = "username"

    /** DB Label "roleid" */
    var roleid: String = "roleid"
  }

  /** holds all unique labels */
  val dbLabels = new DBLabels()

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
      userList += Map(dbLabels.userid -> res.getString(dbLabels.userid),
        "prename" -> res.getString("prename"),
        "surname" -> res.getString("surname"),
        dbLabels.roleid -> res.getString(dbLabels.roleid),
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
  @deprecated( "use insertUserIntoDB", "0.1" )
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

  /**
    * verfiyUserByToken reads from a given String if this is a token and if yes get information form it
    * idea based on https://aboullaite.me/spring-boot-token-authentication-using-jwt/
    * The Token contains an `iat` - and issued at unix time which will be checked that it is not too old
    *
    * @author Benjamin Manns
    * @param jwtToken String
    * @return User
    */
  def verfiyUserByToken(jwtToken: String): User = {
    try {
      val secrets = new Secrets()
      val currentDate = new Date()
      val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(secrets.getSuperSecretKey)).parseClaimsJws(jwtToken).getBody
      val tokenDate: Integer = claims.get("iat").asInstanceOf[Integer]

      /* Useful properties:
      claims.getSubject
      claims.get("roles")
       */

      if((currentDate.getTime()-tokenDate*1000L) > 12*3600*1000L)
      {
        null
      }
      else{
        this.loadUserFromDB(claims.get("username").asInstanceOf[String])
      }

    }
    catch {
      case e@(_: JwtException | _: IllegalArgumentException) =>
        null
    }
  }

  /**
    * insertUserIfNotExists needs to run on every user log in.
    * @param username a unique identification for a user
    * @param roleid a user role, until now, only one role exists
    * @return User
    */
  def insertUserIfNotExists(username: String, roleid: Integer): User ={
    val user: User = this.loadUserFromDB(username)
    if(user == null) {
      // insert new User

      val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO users " +
        "(username, roleid) VALUES (?,?);", Statement.RETURN_GENERATED_KEYS)
      prparStmt.setString(1, username)
      prparStmt.setInt(2, roleid)
      prparStmt.execute()
      var insertedID = -1
      val rs = prparStmt.getGeneratedKeys
      if (rs.next) insertedID = rs.getInt(1)

      if (insertedID == -1) {
        throw new RuntimeException("Error creating user. Please contact administrator.")
      }
      loadUserFromDB(username)
    }
    else{
      user
    }

  }

  /**
    * loadUserFromDB by a given username. If user not exists return null
    * @param username a unique identification for a user
    * @return User | null
    */
  def loadUserFromDB(username: String):User = {
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT * FROM db1.users where username = ? LIMIT 1")
    prparStmt.setString(1,username)
    val resultSet = prparStmt.executeQuery()

    if(resultSet.next())
      {
        new User(resultSet.getInt(dbLabels.userid), resultSet.getString(dbLabels.username))
      }
    else{
      null
    }
  }

  /**
    * generateTokenFromUser simply uses JWT technologies
    *
    * @author Benjamin Manns
    * @param user User
    * @return token as String
    */
  def generateTokenFromUser(user: User): String = {

    val secrets = new Secrets()
    val jwtToken = Jwts.builder.setSubject("client_authentication")
      .claim("roles", "user")
      .claim(dbLabels.username, user.username)
      .setIssuedAt(new Date())
      .signWith(SignatureAlgorithm.HS256, secrets.getSuperSecretKey)
      .compact

    jwtToken
  }

}
