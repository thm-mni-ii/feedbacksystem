package de.thm.ii.fbs.fbs_identity_service.service.auth

import de.thm.ii.fbs.fbs_identity_service.model.user.User
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @param:Value("\${app.jwt.secret}")
    private val jwtSecret: String,

    @param:Value("\${app.jwt.expires-in}")
    private val expiresIn: Long
) {
    private val signingKey: SecretKey =
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))


    fun createToken(user: User): String {
        val now = Date()
        val expiration = Date(now.time + expiresIn * 1000)

        return Jwts.builder()
            .subject(user.id.toString())
            .claim("username", user.username)
            .claim("globalRole", user.globalRole.name)
            .issuedAt(now)
            .expiration(expiration)
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact()
    }

    fun getExpiresIn(): Long {
        return expiresIn
    }
}
