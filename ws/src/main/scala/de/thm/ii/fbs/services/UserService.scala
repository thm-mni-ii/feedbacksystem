package de.thm.ii.fbs.services

import java.security.MessageDigest
import java.util.Date

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.util.DB
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import javax.servlet.http.HttpServletRequest
import javax.xml.bind.DatatypeConverter
import org.json.JSONArray
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * UserService serves all user data in both directions using mysql
  *
  * @author Benjamin Manns
  */
@Component
class UserService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  @Value("${compile.production}")
  private val compile_production: Boolean = true
  /** holds connection to storageService*/
  val storageService = new StorageService(compile_production)

  @Autowired
  private val courseService: CourseService = null
  /**
    * Class holds all DB labels
    */
  class DBLabels {
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
  @Autowired
  private val jwtTokenService: JWTTokenService = null
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
        "email" -> res.getString("email"),
        dbLabels.username -> res.getString(dbLabels.username))
    })
  }

  /**
    * Perform a guest login of a user
    * @author Benjamin Manns
    * @param username username
    * @param password plain user password
    * @return Option of User, can be empty
    */
  def guestLogin(username: String, password: String): Option[User] = {
    val users = DB.query("SELECT * FROM user join role using(role_id) where username = ? and password = ?", (res, _) => {
      new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
        res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email), res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id),
        false, res.getString(UserDBLabels.password))
    }, username, hashPassword(password))
    users.headOption
  }

  /**
    * hash the plain text a standard way
    * @param password plain password
    * @return the hashed password
    */
  def hashPassword(password: String): String = {
    val md = MessageDigest.getInstance("SHA-1")
    md.digest(password.getBytes("UTF-8")).map("%02x".format(_)).mkString
  }

  /**
    * Create a guest login / account / user
    * @author Benjamin Manns
    * @param prename users prename
    * @param surname users surname / family name
    * @param role_id users role_id
    * @param username users username
    * @param password users password
    * @param email users email
    * @return success of update
    */
  def createGuestAccount(prename: String, surname: String, role_id: Int, username: String, password: String, email: String): Boolean = {
    1 == DB.update("INSERT INTO user (username, email, prename, surname, role_id, password) VALUES (?,?,?,?,?,?);",
      username, email, prename, surname, role_id, hashPassword(password))
  }

  /**
    * Set a new passwd for a guest account
    * @param userid the user identification
    * @param password plain password which just set
    * @return success of update
    */
  def updatePasswordByUser(userid: Int, password: String): Boolean = {
    1 == DB.update("UPDATE user set password = ? WHERE user_id = ?;", hashPassword(password), userid)
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
  def verifyUserByHeaderToken(request: HttpServletRequest): Option[User] = {
    val authHeader = request.getHeader("Authorization")
    if (authHeader != null) {
      try {
        val jwtToken = authHeader.split(" ")(1)
        try {
          verifyUserByTocken(jwtToken)
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
    * Maps JWT Token to its user object after checking its validity.
    * @param jwtToken The provided jwt token.
    * @return The user object or None if jwt token was invalid.
    */
  def verifyUserByTocken(jwtToken: String): Option[User] = {
    val currentDate = new Date()
    val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(jwtTokenService.jwtSecretEncoding())).parseClaimsJws(jwtToken).getBody
    val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

    // Token is expired
    if (tokenDate * 1000L - currentDate.getTime <= 0) {
      None
    } else {
      this.loadUserFromDB(claims.get(dbLabels.username).asInstanceOf[String], true)
    }
  }

  /**
    * grant User to a global role
    * @author Benjamin Manns
    * @param user which user should be granted
    * @param role which role should user get
    * @return status if update worked out
    */
  def grantUser(user: User, role: String): Boolean = {
    val roles = Map("ADMIN" -> 1, "MODERATOR" -> 2, "DOCENT" -> 4)
    1 == DB.update("UPDATE user set role_id = ? WHERE user_id = ? ", roles(role), user.userid)
  }
  /**
    * revoke a users global role
    * @author Benjamin Manns
    * @param user which user should be revoked
    * @return status if update worked out
    */
  def revokeUser(user: User): Boolean = {
    1 == DB.update("UPDATE user set role_id = 16 WHERE user_id = ? ", user.userid)
  }

  /**
    * insertUserIfNotExists needs to run on every user log in.
    * @param username a unique identification for a user
    * @param mail LDAP Mail Information from user
    * @param prename user / student official prename
    * @param surname user / student official surname
    * @param role_id a user role, until now, only one role exists
    * @return User
    */
  def insertUserIfNotExists(username: String, mail: String, prename: String, surname: String, role_id: Integer): User = {
    val user: Option[User] = this.loadUserFromDB(username)
    if(user.isEmpty) {
      DB.update("INSERT INTO user (username, email, prename, surname, role_id) VALUES (?,?,?,?,?);", username, mail, prename, surname, role_id)
      loadUserFromDB(username).get
    } else {
      user.get
    }
  }

  /**
    * Load user by a given username.
    * @param username a unique identification for a user
    * @param loadPW load DB pw hash, otherwise NULL
    * @return The user having the given username if such one exists.
    */
  def loadUserFromDB(username: String, loadPW: Boolean = false): Option[User] = {
    val users = DB.query("SELECT u.*, r.role_name as role_name FROM user u join role r using(role_id) where username = ? LIMIT 1",
      (res, _) => {
        val pw = if (loadPW) res.getString(UserDBLabels.password) else null
        new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
          res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email), res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id),
          res.getBoolean(UserDBLabels.privacy_checked), pw)
      }, username)

    users.headOption
  }

  /**
    * Load user by a given username with permission for a specific course.
    * @param username a unique identification for a user
    * @param courseId a unique identification for a course
    * @param loadPW load DB pw hash, otherwise NULL
    * @return The user having the given username if such one  in the specified course.
    */
  def loadCourseUserFromDB(username: String, courseId: Int, loadPW: Boolean = false): Option[User] = {
    val users = DB.query("SELECT u.user_id, u.username, u.prename, u.surname, u.email, r.role_name as role_name, uc.role_id, u.privacy_checked " +
      "FROM user u " +
      "join user_course uc using(user_id) " +
      "join role r on uc.role_id = r.role_id " +
      "where username = ? and uc.course_id = ? LIMIT 1",
      (res, _) => {
        val pw = if (loadPW) res.getString(UserDBLabels.password) else null
        new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
          res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email), res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id),
          res.getBoolean(UserDBLabels.privacy_checked), pw)
      }, username, courseId)

    users.headOption
  }

  /**
    * User can accept the privacy policy
    * @author Benjamin Manns
    * @param username accepting user
    * @return if update worked out
    */
  def acceptPrivacyForUser(username: String): Boolean = {
    1 == DB.update("Update user set privacy_checked = 1 where username = ?", username)
  }

  /**
    * Load user by a given userid.
    * @param userid a unique identification for a user
    * @return The user having the given username if such one exists.
    */
  def loadUserFromDB(userid: Int): Option[User] = {
    val users = DB.query("SELECT u.*, r.role_name as role_name FROM user u join role r using(role_id) where user_id = ? LIMIT 1",
      (res, _) => {
        new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
          res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email), res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id),
          res.getBoolean(UserDBLabels.privacy_checked))
      }, userid)

    users.headOption
  }

  /**
    * get a full list of user information
    * @param id a unique identification for a user
    * @return Scala Map full user list
    */
  def getFullUserById(id: Int): Option[Map[String, Any]] = {
    val user = DB.query("SELECT u.*, r.role_name FROM user u join role r using(role_id) where user_id = ? LIMIT 1",
      (res, _) => {
        Map(UserDBLabels.email -> res.getString(UserDBLabels.email),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.user_id -> res.getInt(UserDBLabels.user_id),
          UserDBLabels.username -> res.getString(UserDBLabels.username),
          UserDBLabels.role_id -> res.getInt(UserDBLabels.role_id),
          UserDBLabels.role_name -> res.getString(UserDBLabels.role_name))
      }, id)

    user.headOption
  }

  /**
    * delete a user by it's id and all beloning personalised submissions
    * Uses deleteUser with its it
    * @author Benjamin Manns
    * @param user User object which will be deleted
    * @return if deletion worked
    */
  def deleteUser(user: User): Boolean = {
    this.deleteUser(user.userid)
  }

  /**
    * delete a user by it's id and all beloning non personalised submissions
    * @author Benjamin Manns
    * @param userid unique User ID which will be deleted
    * @return if deletion worked
    */
  def deleteUser(userid: Int): Boolean = {
    for (line <- getBelongingPersonalisedSubmissions(userid)){
      storageService.deleteSubmission(line(TaskDBLabels.taskid).asInstanceOf[Int],
        line(SubmissionDBLabels.submissionid).asInstanceOf[Int], line(SubmissionDBLabels.filename).asInstanceOf[String])
    }
    // delete also course role references
    DB.update("delete from user_course where user_id = ?", userid)
    1 == DB.update("Update user set prename = 'Deleted User', surname = 'Deleted User', " +
      "username = 'Deleted User', email = '', status = -1 where user_id = ?", userid)
  }

  private def getBelongingPersonalisedSubmissions(userid: Int) = {
    DB.query("select * from (select * from user_course where user_id = ?) uc join course c on uc.course_id = c.course_id " +
      "and personalised_submission = 1 join task t on t.course_id = c.course_id left join submission s on t.task_id = s.task_id and s.user_id = ?",
      (res, _) => {
          Map(TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          SubmissionDBLabels.submissionid-> res.getInt(SubmissionDBLabels.submissionid),
          SubmissionDBLabels.filename-> res.getString(SubmissionDBLabels.filename))
      }, userid, userid)
  }

  /**
    * Calculates if given user is at least for one course a docent, so he has access to see all testsystem.
    * @param userid unique User identification
    * @return if User is a docent or not
    */
  def checkIfUserAtLeastOneDocent(userid: Int): Boolean = {
    val list = DB.query("select count(*) > 0 as docent from user_course where user_id = ? and role_id IN (4)",
      (res, _) => res.getInt("docent"), userid)
    list.nonEmpty && list.head == 1
  }

  /**
    * Calculates if given user is at least for one course a docent, so he has access to see all testsystem.
    * @param userid unique User identification
    * @return if User is a docent or not
    */
  def checkIfUserAtLeastOneTutor(userid: Int): Boolean = {
    val list = DB.query("select count(*) > 0 as tutor from user_course where user_id = ? and role_id IN (8)",
      (res, _) => res.getInt("tutor"), userid)
    list.nonEmpty && list.head == 1
  }

  /**
    * generateTokenFromUser simply uses JWT technologies
    *
    * @author Benjamin Manns
    * @param user User
    * @return token as String
    */
  def generateTokenFromUser(user: User): String = {
    var role_id = user.roleid
    var role_name = user.role

    // sometimes a user is a temporarily docent, he will also have more access rights!
    if (role_id > RoleDBLabels.DOCENT_ROLE_ID && checkIfUserAtLeastOneDocent(user.userid)) {
      role_id = RoleDBLabels.DOCENT_ROLE_ID
      role_name = "docent"
    }
    Jwts.builder.setSubject("client_authentication")
      .claim(UserDBLabels.user_id, user.userid)
      .claim(UserDBLabels.username, user.username)
      .claim(UserDBLabels.prename, user.prename)
      .claim(UserDBLabels.surname, user.surname)
      .claim(UserDBLabels.role_id, role_id)
      .claim(UserDBLabels.role_name, role_name)
      .claim(UserDBLabels.email, user.email)
      .claim(UserDBLabels.tutor_in_course, courseService.getCoursesAsTutor(user).mkString(","))
      .claim(UserDBLabels.docent_in_course, courseService.getCoursesAsDocent(user).mkString(","))
      .claim("guest", user.password != null)
      .claim("token_type", "user")
      .setIssuedAt(new Date())
      .setExpiration(new Date(new Date().getTime + (1000 * Integer.parseInt(jwtExpirationTime))))
      .signWith(SignatureAlgorithm.HS256, jwtTokenService.jwtSecretEncoding())
      .compact
  }
}
