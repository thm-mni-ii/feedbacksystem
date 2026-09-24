package de.thm.ii.fbs.services.security

import java.util.Date
import de.thm.ii.fbs.controller.exception.UnauthorizedException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, User}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.util.{DB, ScalaObjectMapper}
import io.jsonwebtoken.{Claims, Jwts, SignatureAlgorithm}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.http.HttpHeaders
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.{Jwt, JwtDecoder}

import scala.util.Try

/**
  * Authentication service
  */
@Component
class AuthService {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val crs: CourseRegistrationService = null
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  @Autowired(required = false)
  private val jwtDecoder: JwtDecoder = null

  @Value("${jwt.secret:8Dsupersecurekeydf0}")
  private val jwtSecret: String = null

  @Value("${jwt.expiration.time:43200}")
  private val jwtExpirationTime: String = null

  /**
    * JWT Token as Base64
    * @return base64 encoded JWT Secret
    */
  def jwtSecretEncoding(): String = DatatypeConverter.printBase64Binary(jwtSecret.getBytes)

  /**
    * Generate a new token and append it to the response header.
    * @param user The user
    * @param res The response
    */
  def renewAuthentication(user: User, res: HttpServletResponse): Unit = {
    // Deprecated for OIDC PKCE flow
  }

  private def getOrProvisionUser(jwt: Jwt): Option[User] = {
    Try(jwt.getSubject.toInt).toOption.flatMap { uid =>
      userService.find(uid).orElse {
        val username = Option(jwt.getClaimAsString("preferred_username"))
          .orElse(Option(jwt.getClaimAsString("username")))
          .getOrElse(s"user_$uid")
        val prename = Option(jwt.getClaimAsString("given_name")).getOrElse("User")
        val surname = Option(jwt.getClaimAsString("family_name")).getOrElse(s"$uid")
        val email = Option(jwt.getClaimAsString("email")).orNull
        val roleStr = Option(jwt.getClaimAsString("globalRole")).getOrElse("USER")
        val role = GlobalRole.parse(roleStr)

        Try {
          DB.insert(
            "INSERT INTO user (user_id, prename, surname, email, username, global_role) VALUES (?, ?, ?, ?, ?, ?) " +
              "ON DUPLICATE KEY UPDATE username = VALUES(username), global_role = VALUES(global_role);",
            uid, prename, surname, email, username, role.id)
        }
        userService.find(uid)
      }
    }
  }

  /**
    * Check for valid authentication information and return the user associated with the authentication.
    * @param req The http request
    * @param res The http response (nullable)
    * @return The user.
    */
  def authorize(req: HttpServletRequest, res: HttpServletResponse = null): User = {
    val userFromSecurityContext = Option(SecurityContextHolder.getContext.getAuthentication)
      .map(_.getPrincipal)
      .collect { case jwt: Jwt => jwt }
      .flatMap(getOrProvisionUser)

    userFromSecurityContext.orElse(authorizeRequest(req).flatMap(userService.find)) match {
      case Some(user) => user
      case None => throw new UnauthorizedException
    }
  }

  /**
    * Check for valid authentication information and return the user associated with the authentication.
    * @param token The authentication token
    * @return The user.
    */
  def authorize(token: String): User = {
    val userFromJwt = Option(jwtDecoder).flatMap(d => Try(d.decode(token)).toOption).flatMap(getOrProvisionUser)
    userFromJwt.orElse(userService.find(authorizeToken(token))) match {
      case Some(user) => user
      case None => throw new UnauthorizedException
    }
  }

  private def authorizeRequest(request: HttpServletRequest): Option[Int] =
    Try(request.getHeader(HttpHeaders.AUTHORIZATION)).map(_.split(" ")(1)).map(authorizeToken).toOption

  private def authorizeToken(jwtToken: String): Int = {
    val decodedFromJwk = Option(jwtDecoder).flatMap(decoder => Try(decoder.decode(jwtToken).getSubject.toInt).toOption)

    decodedFromJwk match {
      case Some(id) => id
      case None =>
        val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(jwtSecretEncoding())).parseClaimsJws(jwtToken).getBody
        val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

        if (tokenDate != null && tokenDate * 1000L - new Date().getTime <= 0) {
          throw new RuntimeException("Expired Token")
        } else {
          val idObj = claims.get("id")
          if (idObj != null) {
            idObj.asInstanceOf[Int]
          } else {
            claims.getSubject.toInt
          }
        }
    }
  }

  /**
    * Generate a new token from the users information
    *
    * @param user User
    * @return new token
    */
  def createToken(user: User): String = {
    val privileges = crs.getCoursePrivileges(user.id)
    val mapper = new ScalaObjectMapper

    val courseRoles = privileges match {
      case m: Map[Int, CourseRole.Value] if m.isEmpty => "{}"
      case _ => mapper.writeValueAsString(privileges.map((f: (Int, CourseRole.Value)) => (f._1, f._2.toString)))
    }

    Jwts.builder.setSubject("client_authentication")
      .claim("id", user.id)
      .claim("username", user.username)
      .claim("globalRole", user.globalRole.toString)
      .claim("courseRoles", courseRoles)
      .setIssuedAt(new Date())
      .setExpiration(new Date(new Date().getTime + (1000 * Integer.parseInt(jwtExpirationTime))))
      .signWith(SignatureAlgorithm.HS256, jwtSecretEncoding())
      .compact
  }
}
