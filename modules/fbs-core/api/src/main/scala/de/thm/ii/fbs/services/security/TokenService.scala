package de.thm.ii.fbs.services.security

import de.thm.ii.fbs.services.v2.security.JwtSecretProvider
import io.jsonwebtoken.{Claims, ExpiredJwtException, Jwts}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import java.util.Date

/**
  * Service for issuing and checking multi purpose jwt tokens
  */
@Component
class TokenService {
  @Autowired
  private val jwtSecretProvider: JwtSecretProvider = null

  def issue(subject: String, expires: Int): String = {
    Jwts.builder
      .subject(subject)
      .issuedAt(new Date())
      .expiration(new Date(new Date().getTime + (1000 * expires)))
      .signWith(jwtSecretProvider.getKey, Jwts.SIG.HS256)
      .compact
  }

  def verify(token: String): Option[String] = {
    try {
      val claims: Claims = Jwts.parser().verifyWith(jwtSecretProvider.getKey).build().parseSignedClaims(token).getPayload
      Some(claims.get("sub").asInstanceOf[String])
    } catch {
      case _: ExpiredJwtException => None
    }
  }
}
