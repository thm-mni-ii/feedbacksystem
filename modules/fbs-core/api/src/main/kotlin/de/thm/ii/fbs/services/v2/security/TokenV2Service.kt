package de.thm.ii.fbs.services.v2.security

import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.security.LegacyToken
import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import javax.xml.bind.DatatypeConverter

@Component
class TokenV2Service(
    @Value("\${jwt.secret}")
    private val jwtSecret: String
) {
    fun issue(subject: String, expires: Int) {
        Jwts.builder()
            .setSubject(subject)
            .setIssuedAt(Date())
            .setExpiration(Date(Date().time + (1000 * expires)))
            .signWith(SignatureAlgorithm.HS256, jwtSecretEncoding())
            .compact()
    }

    fun verify(token: String): String? =
        try {
            val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.toByteArray()).parseClaimsJws(token).body
            claims["sub"] as String
        } catch (e: ExpiredJwtException) {
            null
        }

    fun verifyLegacyToken(token: String): LegacyToken? =
        try {
            val claims: Claims = Jwts.parser().setSigningKey(jwtSecret.toByteArray()).parseClaimsJws(token).body
            LegacyToken(claims["id"] as Int, claims["username"] as String, GlobalRole.valueOf(claims["globalRole"]as String))
        } catch (e: ExpiredJwtException) {
            null
        }

    fun jwtSecretEncoding(): String = DatatypeConverter.printBase64Binary(jwtSecret.toByteArray())
}
