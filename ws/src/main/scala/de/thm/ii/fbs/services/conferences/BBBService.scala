package de.thm.ii.fbs.services.conferences

import java.net.URI
import java.security.MessageDigest
import java.util.UUID

import de.thm.ii.fbs.model.User
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.jackson.JsonObjectDeserializer
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder

import scala.language.postfixOps

/**
  * Handles BBB requests.
  * @param templateBuilder Request template builder.
  * @param apiUrl the bbb api url
  * @param secret the bbb secret
  * @author Simon Schniedenharn
  */
@Service
class BBBService(templateBuilder: RestTemplateBuilder,
                 @Value("${services.bbb.service-url}") private val apiUrl: String,
                 @Value("${services.bbb.shared-secret}") private val secret: String)
  extends ConferenceService {
  /**
    * Creates a new Conference using BBB
    * @param courseid the id for the new conference
    * @return the newly created conference
    */
  override def createConference(courseid: String): Conference = {
    val cid = UUID.randomUUID().toString
    val participantPassword = UUID.randomUUID().toString
    val modPassword = UUID.randomUUID().toString

    // actual registering of conference against BBB api
    this.registerBBBConference(cid, cid, participantPassword, modPassword)
    new Conference {
      override val id: String = cid
      override val serviceName: String = BBBService.name
      override var visibility: String = "false"
      override val courseId: String = courseid
      private val meetingPassword: String = participantPassword
      private val moderatorPassword: String = modPassword

      override def getURL(user: User, moderator: Boolean): URI =
        BBBService.this.getBBBConferenceLink(user, id, if (moderator) moderatorPassword else meetingPassword)

      override def toMap: Map[String, String] = Map(
        "meetingId" -> id,
        "meetingPassword" -> meetingPassword,
        "moderatorPassword" -> moderatorPassword,
        "service" -> serviceName
      )

      override def toJson: JSONObject = new JSONObject().put("meetingId", id)
        .put("courseId", courseId)
        .put("service", serviceName)
        .put("meetingPassword", meetingPassword)
        .put("moderatorPassword", moderatorPassword)
        .put("visibility", visibility)
    }
  }

  private val restTemplate = templateBuilder.build()

  /**
    * Register a new conference.
    * @param id Conference id to register.
    * @param meetingName Conference id to register.
    * @param password password to register.
    * @param moderatorPassword moderator password to register.
    * @return boolean showing if creation of room was successful
    */
  def registerBBBConference(id: String, meetingName: String, password: String, moderatorPassword: String): Boolean = {
    val response = getBBBAPI("create", Map("name" -> meetingName, "meetingID" -> id,
      "attendeePW" -> password, "moderatorPW" -> moderatorPassword))
    response.getStatusCode.is2xxSuccessful()
  }

  /**
    * Get join Link for conference users conference.
    * @param id Conference id to register.
    * @param user user name to register.
    * @param password password to register.
    * @return The uri of the registered conference
    */
  def getBBBConferenceLink(user: User, id: String, password: String): URI = {
    val link = buildBBBRequestURL("join", Map("fullName" -> s"${user.prename} ${user.surname}",
      "meetingID" -> id, "password" -> password))
    URI.create(link)
  }

  /**
    * Sends a GET-Request to the BBB API
    * @param method The BBB methode to invoked
    * @param params The params to send
    * @return The ResponseEntity
    */
  private def getBBBAPI(method: String, params: Map[String, String]): ResponseEntity[String] = {
    val url = buildBBBRequestURL(method, params)
    restTemplate.getForEntity(url, classOf[String])
  }

  /**
    * Builds a BBB API URL with checksum
    * @param method The method of the url
    * @param params The params of the url
    * @return The BBB API with checksum
    */
  private def buildBBBRequestURL(method: String, params: Map[String, String]): String = {
    val queryBuilder = UriComponentsBuilder.newInstance()
    for ((key, value) <- params) {
      queryBuilder.queryParam(key, value);
    }
    var query = queryBuilder.toUriString.substring(1)
    val checksum = computeHexSha1Hash(s"$method$query$secret")
    queryBuilder.queryParam("checksum", checksum)
    query = queryBuilder.toUriString.substring(1)
    s"$apiUrl/api/$method?$query"
  }

  /**
    * Hashes input
    * @param input the input to hash
    * @return the hex-encoeded hash
    */
  private def computeHexSha1Hash(input: String): String = {
    val digest = MessageDigest.getInstance("SHA-1")
    digest.update(input.getBytes("utf8"))
    val hash = digest.digest()
    toHexString(hash)
  }

  /**
    * Hex encodes input
    * @param input the input to encode
    * @return the encoded input
    */
  private def toHexString(input: Array[Byte]): String = input
    .map(b => String.format("%02x", b))
    .reduce((sb, s) => sb + s)
}

/**
 Companion object carrying name attribute
 */
object BBBService {
  /**
   * name attribute
   */
  val name = "bigbluebutton"
}
