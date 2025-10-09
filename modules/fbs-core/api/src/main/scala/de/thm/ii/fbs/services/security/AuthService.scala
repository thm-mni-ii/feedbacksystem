package de.thm.ii.fbs.services.security

import java.util.Date

import de.thm.ii.fbs.controller.exception.UnauthorizedException
import de.thm.ii.fbs.model.{CourseRole, User}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.util.ScalaObjectMapper
import io.jsonwebtoken.{Claims, Jwts, SignatureAlgorithm}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component
import org.springframework.http.HttpHeaders

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

  @Value("${jwt.secret}")
  private val jwtSecret: String = null

  @Value("${jwt.expiration.time}")
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
    val token = this.createToken(user)
    res.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
  }

  /**
   * Generate a new token and append it to the response header and updates the user last login.
   * @param user The user
   * @param res The response
   */
  def newAuthentication(user: User, res: HttpServletResponse): Unit = {
    this.userService.updateLastLogin(user.id)
    this.renewAuthentication(user, res)
  }

  /**
    * Check for valid authentication information and return the user associated with the authentication.
    * @param req The http request
    * @param res The http response (nullable)
    * @return The user.
    */
  def authorize(req: HttpServletRequest, res: HttpServletResponse = null): User = authorizeRequest(req).flatMap(userService.find) match {
      case Some(user) =>
        if (res != null) renewAuthentication(user, res)
        user
      case None => throw new UnauthorizedException
    }

  /**
    * Check for valid authentication information and return the user associated with the authentication.
    * @param token The authentication token
    * @return The user.
    */
  def authorize(token: String): User = userService.find(authorizeToken(token)) match {
      case Some(user) => user
      case None => throw new UnauthorizedException
    }

  private def authorizeRequest(request: HttpServletRequest): Option[Int] =
    Try(request.getHeader(HttpHeaders.AUTHORIZATION)).map(_.split(" ")(1)).map(authorizeToken).toOption

  private def authorizeToken(jwtToken: String): Int = {
    val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(jwtSecretEncoding())).parseClaimsJws(jwtToken).getBody
    val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

    if (tokenDate * 1000L - new Date().getTime <= 0) {
      throw new RuntimeException("Expired Token")
    } else {
      claims.get("id").asInstanceOf[Int]
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
