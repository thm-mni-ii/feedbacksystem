package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet, Statement}
import java.util
import java.util.Date
import de.thm.ii.submissioncheck.config.MySQLConfig
import de.thm.ii.submissioncheck.misc.BadRequestException
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import javax.servlet.http.HttpServletRequest
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
    /** DB Label "user_id" */
    var user_id: String = "user_id"

    /** DB Label "username" */
    var username: String = "username"

    /** DB Label "role_id" */
    var role_id: String = "role_id"
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
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT * FROM user")
    val resultSet = prparStmt.executeQuery()
    var userList = new ListBuffer[java.util.Map[String, String]]()

    val resultIterator = new Iterator[ResultSet] {
      def hasNext: Boolean = resultSet.next()
      def next(): ResultSet = resultSet
    }.toStream

    for (res <- resultIterator.iterator) {
      userList += Map(dbLabels.user_id -> res.getString(dbLabels.user_id),
        "prename" -> res.getString("prename"),
        "surname" -> res.getString("surname"),
        dbLabels.role_id -> res.getString(dbLabels.role_id),
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
    * @param role_id          Users's role id
    * @return Java Map
    */
  @deprecated( "use insertUserIntoDB", "0.1" )
  def addUser(prename: String, surname: String, password_clear: String, password_repeat: String, email: String, role_id: Int = 1): util.Map[String, Int] = {

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
    val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO user " +
      "(prename, surname, password, email, role_id) VALUES (?,?,?,?,?);", Statement.RETURN_GENERATED_KEYS)

    // scala doc checker fix
    val param4: Int = 4
    val param5: Int = 5
    prparStmt.setString(1, prename)
    prparStmt.setString(2, surname)
    prparStmt.setString(3, passwordCrypt)
    prparStmt.setString(param4, email)
    prparStmt.setInt(param5, role_id)
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
    * verfiyUserByHeaderToken reads from a given User Request the Bearer Token if this is a token and if yes get information form it
    * idea based on https://aboullaite.me/spring-boot-token-authentication-using-jwt/
    * The Token contains an `iat` - and expiration at unix time which will be checked that it is not too old
    *
    * @author Benjamin Manns
    * @param request a Users Request Body
    * @return User
    */
  def verfiyUserByHeaderToken(request: HttpServletRequest): User = {
    try{
      val authHeader = request.getHeader("Authorization")
      var jwtToken = authHeader.split(" ")(1)

      try {
        val secrets = new Secrets()
        val currentDate = new Date()
        val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(secrets.getSuperSecretKey)).parseClaimsJws(jwtToken).getBody
        val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

        /* Useful properties:
        claims.getSubject
        claims.get("roles")
         */

        // Token is expired
        if((tokenDate)*1000L-currentDate.getTime <= 0)
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
    catch{
      case e: ArrayIndexOutOfBoundsException => {
        null
      }

    }
  }

  /**
    * insertUserIfNotExists needs to run on every user log in.
    * @param username a unique identification for a user
    * @param role_id a user role, until now, only one role exists
    * @return User
    */
  def insertUserIfNotExists(username: String, role_id: Integer): User ={
    val user: User = this.loadUserFromDB(username)
    if(user == null) {
      // insert new User

      val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO user " +
        "(username, role_id) VALUES (?,?);", Statement.RETURN_GENERATED_KEYS)
      prparStmt.setString(1, username)
      prparStmt.setInt(2, role_id)
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
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT * FROM user where username = ? LIMIT 1")
    prparStmt.setString(1,username)
    val resultSet = prparStmt.executeQuery()

    if(resultSet.next())
      {
        new User(resultSet.getInt(dbLabels.user_id), resultSet.getString(dbLabels.username))
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
      .setExpiration(new Date(new Date().getTime + (1000*3600)))
      .signWith(SignatureAlgorithm.HS256, secrets.getSuperSecretKey)
      .compact

    jwtToken
  }

}
