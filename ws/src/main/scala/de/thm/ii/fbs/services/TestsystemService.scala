package de.thm.ii.fbs.services

import java.util
import java.util.Date

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import de.thm.ii.fbs.TestsystemTestfileLabels
import de.thm.ii.fbs.model.Testsystem
import de.thm.ii.fbs.util.{BadRequestException, DB}
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import javax.servlet.http.HttpServletRequest
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import scala.reflect.Manifest

/**
  * TestsystemService provides interaction with DB table testsystem
  *
  * @author Benjamin Manns
  */
@Component
class TestsystemService {
  @Value("${jwt.expiration.time}")
  private val jwtExpirationTime: String = null
  @Autowired
  private val jwtTokenService: JWTTokenService = null

  // null safe to string
  private def nts(a: Any) = if (a == null) "null" else a.toString

  /**
    * get information about one testsystem
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @return Scala Map
    */
  def getTestsystem(id_string: String): Option[Testsystem] = {
    GitChecker.CHECKERS.get(id_string).map(m => new Testsystem(
        nts(m.get(TestsystemLabels.id)),
        nts(m.get(TestsystemLabels.name)),
        nts(m.get(TestsystemLabels.description)),
        nts(m.get(TestsystemLabels.supported_formats)),
        nts(m.get(TestsystemLabels.machine_port)),
        nts(m.get(TestsystemLabels.machine_ip)),
        loadTestfilesByTestsystem(id_string)
    ))
  }

  /**
    * load specification which files a testsystem needs
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @return Scala Map of Testfiles Specifications
    */
  def loadTestfilesByTestsystem(id_string: String): List[Map[String, Any]] =
    GitChecker.CHECKERS.get(id_string).flatMap(_.get("testfiles")).toList.asInstanceOf[List[Map[String, Any]]]

  /**
    * get all testsystems
    * @author Benjamin Manns
    * @return List of Scala Maps
    */
  def getTestsystems: List[Map[String, Any]] = GitChecker.CHECKERS.values.toList

  /**
    * get the corresponding settingskeys of the testsystem
    * @param testsystem_id testsystem id
    * @return list of settings keys
    */
  def getSettingsOfTestsystem(testsystem_id: String): List[Map[String, Any]] =
    GitChecker.SETTINGS.get(testsystem_id).toList

  /**
    * generate an array of topics for all registered testsystems
    * @param topic a topic name
    * @return generated topic list where kafka can listen on
    */
  def getTestsystemsTopicLabelsByTopic(topic: String): List[String] = {
    var topicList = List[String]()
    val testsystems = this.getTestsystems
    for(m <- testsystems){
      topicList = m("testsystem_id").toString :: topicList
    }
    topicList = topicList.map(f => f + "_" + topic)
    topicList
  }

  /**
    * generate a JWT from a given testsystem
    *
    * @author Benjamin Manns
    * @param id_string Testsystem Name / ID
    * @return token as String
    */
  def generateTokenFromTestsystem(id_string: String): String = {
    val jwtToken = Jwts.builder.setSubject("client_authentication")
      .claim("token_type", "testsystem")
      .claim("testsystem_id", id_string)
      .setIssuedAt(new Date())
      .setExpiration(new Date(new Date().getTime + (1000 * Integer.parseInt(jwtExpirationTime))))
      .signWith(SignatureAlgorithm.HS256, jwtTokenService.jwtSecretEncoding())
      .compact

    jwtToken
  }

  /**
    * verfiy test system request by the given Bearer Token provided in the Header request
    * idea based on https://aboullaite.me/spring-boot-token-authentication-using-jwt/
    *
    * @author Benjamin Manns
    * @param request a Request Body
    * @return Map of Testsystem
    */
  def verfiyTestsystemByHeaderToken(request: HttpServletRequest): Option[Testsystem] = {
    val authHeader = request.getHeader("Authorization")
    if (authHeader != null) {
      try {
        val jwtToken = authHeader.split(" ")(1)
        try {
          val currentDate = new Date()
          val claims: Claims = Jwts.parser()
            .setSigningKey(DatatypeConverter
              .parseBase64Binary(jwtTokenService.jwtSecretEncoding())).parseClaimsJws(jwtToken).getBody
          val tokenDate: Integer = claims.get("exp").asInstanceOf[Integer]

          // Token is expired
          if (tokenDate * 1000L - currentDate.getTime <= 0) {
            None
          } else {
            this.getTestsystem(claims.get(TestsystemLabels.id).asInstanceOf[String])
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
}
