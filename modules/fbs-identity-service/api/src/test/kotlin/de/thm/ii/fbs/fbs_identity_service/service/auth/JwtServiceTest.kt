package de.thm.ii.fbs.fbs_identity_service.service.auth

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.junit.jupiter.api.Test

class JwtServiceTest {

    private val jwtSecret = "cmVwb3J0Zm9yZ290dGVucGVvcGxlc2VsbGh1cnJpZWRlYXNpbHlicm91Z2h0c2NpZW4="

    private val expiresIn = 3600L

    private val jwtService = JwtService(
        jwtSecret = jwtSecret,
        expiresIn = expiresIn
    )

    @Test
    fun `getExpiresIn returns configured token lifetime`() {
        assertEquals(3600L, jwtService.getExpiresIn())
    }

    @Test
    fun `createToken creates jwt with expected claims`() {
        val user = User(
            id = 42,
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "niklas",
            globalRole = GlobalRole.ADMIN
        )

        val token = jwtService.createToken(user)

        val claims = Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .payload

        assertEquals("42", claims.subject)
        assertEquals("niklas", claims["username"])
        assertEquals("ADMIN", claims["globalRole"])
        assertNotNull(claims.issuedAt)
        assertNotNull(claims.expiration)

        val tokenLifetimeSeconds =
            (claims.expiration.time - claims.issuedAt.time) / 1000

        assertEquals(expiresIn, tokenLifetimeSeconds)
    }

    private fun signingKey() =
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))
}