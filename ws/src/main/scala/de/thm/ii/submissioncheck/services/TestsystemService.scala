package de.thm.ii.submissioncheck.services
import java.util.Date
import io.jsonwebtoken.{Claims, JwtException, Jwts, SignatureAlgorithm}
import java.io

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.{Testsystem, User}
import de.thm.ii.submissioncheck.security.Secrets
import javax.servlet.http.HttpServletRequest
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * TestsystemService provides interaction with DB table testsystem
  *
  * @author Benjamin Manns
  */
@Component
class TestsystemService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  @Value("${jwt.expiration.time}")
  private val jwtExpirationTime: String = null
  /**
    * create and insert a testsystem information
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @param name testsystem name
    * @param description testsystem description
    * @param supportedFormats which format does a testystem provide
    * @param machinePort port of docker instance
    * @param machineIp ip of docker instance
    * @return inserted primary key
    */
  def insertTestsystem(id_string: String, name: String, description: String, supportedFormats: String, machinePort: Int,
                       machineIp: String): Map[String, String] = {
    val parsedIDString = id_string.toLowerCase.replace(" ", "")
    try{
      var num = DB.update(
        "insert into testsystem (testsystem_id, name, description, supported_formats, machine_port, machine_ip) values (?,?,?,?,?,?)",
        parsedIDString, name, description, supportedFormats, machinePort, machineIp)

      Map(TestsystemLabels.id -> parsedIDString)
    }
    catch {
      case _: Exception => throw new BadRequestException("Provided testsystem id_string may not be unique" +
        " or is too long. Please use a length of maximum 30 characters.")
    }
  }

  /**
    * update testsystem information
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @param name testsystem name
    * @param description testsystem description
    * @param supportedFormats which format does a testystem provide
    * @param machine_port port of docker instance
    * @param machine_ip ip of docker instance
    * @return if update worked out
    */
  def updateTestsystem(id_string: String, name: String, description: String, supportedFormats: String, machine_port: Int, machine_ip: String): Boolean = {
    var ok = true
    if (name != null) {
      val num = DB.update("update testsystem set name = ? where testsystem_id = ?", name, id_string)
    }
    if (description != null) {
      ok = ok && (DB.update("update testsystem set description = ? where testsystem_id = ?", description, id_string) == 1)
    }
    if (supportedFormats != null) {
      ok = ok && (DB.update("update testsystem set supported_formats = ? where testsystem_id = ?", supportedFormats, id_string) == 1)
    }
    if (machine_port > 0) {
      ok = ok && (DB.update("update testsystem set machine_port = ? where testsystem_id = ?", machine_port, id_string) == 1)
    }
    if (machine_ip != null) {
      ok = ok && (DB.update("update testsystem set machine_ip = ? where testsystem_id = ?", machine_ip, id_string) == 1)
    }
    ok
  }

  /**
    * delete a testsystem
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @return if it worked out
    */
  def deleteTestsystem(id_string: String): Boolean = {
    DB.update("delete from testsystem  where testsystem_id = ?", id_string) == 1
  }

  /**
    * get information about one testsystem
    * @author Benjamin Manns
    * @param id_string unique identification for a testsystem
    * @return Scala Map
    */
  def getTestsystem(id_string: String): Option[Testsystem] = {
    val list = DB.query("select * from testsystem  where testsystem_id = ?", (res, _) => {
      new Testsystem(res.getString(TestsystemLabels.id), res.getString(TestsystemLabels.name), res.getString(TestsystemLabels.description),
        res.getString(TestsystemLabels.supported_formats), res.getString(TestsystemLabels.machine_port), res.getString(TestsystemLabels.machine_ip))
    }, id_string)
    list.headOption
  }

  /**
    * get all testsystems
    * @author Benjamin Manns
    * @return List of Scala Maps
    */
  def getTestsystems(): List[Map[String, String]] = {
    DB.query("select * from testsystem", (res, _) => {
      Map(TestsystemLabels.id -> res.getString(TestsystemLabels.id),
        TestsystemLabels.name -> res.getString(TestsystemLabels.name),
        TestsystemLabels.description -> res.getString(TestsystemLabels.description),
        TestsystemLabels.supported_formats -> res.getString(TestsystemLabels.supported_formats),
        TestsystemLabels.machine_ip -> res.getString(TestsystemLabels.machine_ip),
        TestsystemLabels.machine_port -> res.getString(TestsystemLabels.machine_port))
    })
  }

  /**
    * generate an array of topics for all registered testsystems
    * @param topic a topic name
    * @return generated topic list where kafka can listen on
    */
  def getTestsystemsTopicLabelsByTopic(topic: String): Array[String] = {
    var topicList = List[String]()
    val testsystems = this.getTestsystems()
    for(m <- testsystems){
      topicList = m("testsystem_id") :: topicList
    }
    topicList = topicList.map(f => f + "_" + topic)
    topicList.toArray
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
      .signWith(SignatureAlgorithm.HS256, Secrets.getSuperSecretKey)
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
  def verfiyUserByHeaderToken(request: HttpServletRequest): Option[Testsystem] = {
    val authHeader = request.getHeader("Authorization")
    if (authHeader != null) {
      try {
        val jwtToken = authHeader.split(" ")(1)
        try {
          val currentDate = new Date()
          val claims: Claims = Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(Secrets.getSuperSecretKey)).parseClaimsJws(jwtToken).getBody
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
