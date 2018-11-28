package de.thm.ii.submissioncheck.services

import java.util.Date

import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import javax.servlet.http.HttpServletRequest
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import de.thm.ii.submissioncheck.misc.DB
import org.springframework.context.annotation.Configuration
/**
  * UserService serves all user data in both directions using mysql
  *
  * @author Benjamin Manns
  */
@Component
class UserService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * Class holds all DB labels
    */
  class DBLabels{
    /** DB Label "user_id" */
    val user_id: String = "user_id"

    /** DB Label "username" */
    val username: String = "username"

    /** DB Label "role_id" */
    val role_id: String = "role_id"

    /** DB Label "role_name" */
    val role_name: String = "role_name"
  }

  /** holds all unique labels */
  val dbLabels = new DBLabels()

  @Value("${jwt.expiration.time}")
  private val jwtExpirationTime: String = null
  /**
    * getUsers is a admin function und just sends a list of all users
    *
    * @author Benjamin Manns
    * @return JSON (Map) of all current users with no restrictions so far (not printing passwords)
    */
  def getUsers: List[Map[String, String]] = {
    DB.query("SELECT * FROM user", (res, _) => {
      Map(dbLabels.user_id -> res.getString(dbLabels.user_id),
        "prename" -> res.getString("prename"),
        "surname" -> res.getString("surname"),
        dbLabels.role_id -> res.getString(dbLabels.role_id),
        "email" -> res.getString("email"))
    })
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
  def verfiyUserByHeaderToken(request: HttpServletRequest): Option[User] = {
    val authHeader = request.getHeader("Authorization")
    if (authHeader != null) {
      try {
        val jwtToken = authHeader.split(" ")(1)
        try {
          val secrets = new Secrets()
          val currentDate = new Date()
          val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(secrets.getSuperSecretKey)).parseClaimsJws(jwtToken).getBody
          val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

          // Token is expired
          if (tokenDate * 1000L - currentDate.getTime <= 0) {
            None
          } else {
            this.loadUserFromDB(claims.get("username").asInstanceOf[String])
          }
        } catch {
          case _: JwtException | _: IllegalArgumentException => None
        }
      }
      catch {
        case _: ArrayIndexOutOfBoundsException => None
      }
    } else {
      None
    }
  }

  /**
    * insertUserIfNotExists needs to run on every user log in.
    * @param username a unique identification for a user
    * @param role_id a user role, until now, only one role exists
    * @return User
    */
  def insertUserIfNotExists(username: String, role_id: Integer): User = {
    val user: Option[User] = this.loadUserFromDB(username)
    if(user.isEmpty) {
      DB.update("INSERT INTO user (username, role_id) VALUES (?,?);", username, role_id)
      loadUserFromDB(username).get
    } else {
      user.get
    }
  }

  /**
    * Load user by a given username.
    * @param username a unique identification for a user
    * @return The user having the given username if such one exists.
    */
  def loadUserFromDB(username: String): Option[User] = {
    val users = DB.query("SELECT u.*, r.name as role_name FROM user u join role r using(role_id) where username = ? LIMIT 1",
      (res, _) => {
        new User(res.getInt(dbLabels.user_id), res.getString(dbLabels.username), res.getString(dbLabels.role_name))
      }, username)

    users.headOption
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
      .claim("roles", user.role)
      .claim(dbLabels.username, user.username)
      .setIssuedAt(new Date())
      .setExpiration(new Date(new Date().getTime + (1000 * Integer.parseInt(jwtExpirationTime))))
      .signWith(SignatureAlgorithm.HS256, secrets.getSuperSecretKey)
      .compact

    jwtToken
  }
}
