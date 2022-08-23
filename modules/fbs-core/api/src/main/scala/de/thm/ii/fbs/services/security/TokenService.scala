package de.thm.ii.fbs.services.security

import io.jsonwebtoken.{Claims, ExpiredJwtException, Jwts, SignatureAlgorithm}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

import java.util.Date
import javax.xml.bind.DatatypeConverter

/**
  * Service for issuing and checking multi purpose jwt tokens
  */
@Component
class TokenService {
  @Value("${jwt.secret}")
  private val jwtSecret: String = null

  def issue(subject: String, expires: Int): String = {
    Jwts.builder
      .setSubject(subject)
      .setIssuedAt(new Date())
      .setExpiration(new Date(new Date().getTime + (1000 * expires)))
      .signWith(SignatureAlgorithm.HS256, jwtSecretEncoding())
      .compact
  }

  def verify(token: String): Option[String] = {
    try {
      val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.getBytes).parseClaimsJws(token).getBody
      Some(claims.get("sub").asInstanceOf[String])
    } catch {
      case _: ExpiredJwtException => None
    }
  }

  /**
    * JWT Token as Base64
    * @return base64 encoded JWT Secret
    */
  def jwtSecretEncoding(): String = DatatypeConverter.printBase64Binary(jwtSecret.getBytes)
}
