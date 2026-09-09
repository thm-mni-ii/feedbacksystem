package de.thm.ii.fbs.services.v2.security

import de.thm.ii.fbs.model.v2.security.LegacyToken
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Component
import java.util.Date
import javax.xml.bind.DatatypeConverter

@Component
class TokenV2Service(
    @Value("\${jwt.secret:8Dsupersecurekeydf0}")
    private val jwtSecret: String,
    @Autowired(required = false)
    private val jwtDecoder: JwtDecoder? = null
) {
    fun issue(subject: String, expires: Int) {
        Jwts.builder()
            .setSubject(subject)
            .setIssuedAt(Date())
            .setExpiration(Date(Date().time + (1000 * expires)))
            .signWith(SignatureAlgorithm.HS256, jwtSecretEncoding())
            .compact()
    }

    fun verify(token: String): String? {
        return try {
            if (jwtDecoder != null) {
                try {
                    jwtDecoder.decode(token).subject
                } catch (e: Exception) {
                    val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.toByteArray()).parseClaimsJws(token).body
                    claims["sub"] as String
                }
            } else {
                val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.toByteArray()).parseClaimsJws(token).body
                claims["sub"] as String
            }
        } catch (e: Exception) {
            null
        }
    }

    fun verifyLegacyToken(token: String): LegacyToken? {
        return try {
            if (jwtDecoder != null) {
                try {
                    val jwt = jwtDecoder.decode(token)
                    val id = jwt.subject.toIntOrNull()
                    val username = jwt.getClaimAsString("username") ?: ""
                    if (id != null) {
                        return LegacyToken(id, username)
                    }
                } catch (e: Exception) {
                    // fallback to legacy
                }
            }
            val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.toByteArray()).parseClaimsJws(token).body
            val id = claims["id"] as? Int ?: (claims["sub"] as? String)?.toIntOrNull() ?: throw RuntimeException()
            val username = claims["username"] as? String ?: ""
            LegacyToken(id, username)
        } catch (e: Exception) {
            null
        }
    }

    fun jwtSecretEncoding(): String = DatatypeConverter.printBase64Binary(jwtSecret.toByteArray())
}
