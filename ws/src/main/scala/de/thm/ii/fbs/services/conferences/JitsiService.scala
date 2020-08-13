package de.thm.ii.fbs.services.conferences

import java.net.URI
import java.util.Calendar

import io.jsonwebtoken.{Jwts, SignatureAlgorithm}
import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.{HttpEntity, HttpHeaders}
import org.springframework.stereotype.Service

/**
  * Handles Jitsi requests.
  * @param templateBuilder Request template builder.
  * @author Andrej Sajenko
  */
@Service
class JitsiService(templateBuilder: RestTemplateBuilder) {
  private val http = templateBuilder.build()

  @Value("${services.jitsi.shared-secret}")
  private val JITSI_SHARED_SECRET: String = null;

  @Value("${services.jitsi.user}")
  private val JITSI_USER: String = null

  @Value("${services.jitsi.service-url}")
  private val JITSI_URL: String = null

  /**
    * Register a new conference.
    * @param name Conference name to register.
    * @return The uri of the registered conference
    */
  def registerJitsiConference(name: String): URI = {
    val cal = Calendar.getInstance()
    cal.add(Calendar.HOUR, 24)

    val token = Jwts.builder()
      .claim("username", JITSI_USER)
      .setExpiration(cal.getTime)
      .signWith(SignatureAlgorithm.HS512, DatatypeConverter.printBase64Binary(JITSI_SHARED_SECRET.getBytes))
      .compact()

    val body = Map("name" -> name)
    val headers = new HttpHeaders()
    headers.add("Authorization", s"Bearer $token")
    val request = new HttpEntity[Map[String, String]](body, headers)

    http.postForLocation(JITSI_URL, request)
  }
}
