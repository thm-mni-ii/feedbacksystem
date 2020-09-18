package de.thm.ii.fbs.services

import javax.xml.bind.DatatypeConverter
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
  * This Component manages the secret used for generation of JWT Tokens
  */
@Component
class JWTTokenService {
  @Value("${jwt.secret}")
  private val jwtSecret: String = null

  /**
    * public interface to recieve JWT Token in Bae64 encoding
    * @return base64 encoded JWT Secret
    */
  def jwtSecretEncoding(): String = DatatypeConverter.printBase64Binary(jwtSecret.getBytes)
}

