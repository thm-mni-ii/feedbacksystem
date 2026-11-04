package de.thm.ii.fbs.services.v2.security

import de.thm.ii.fbs.model.v2.security.LegacyToken
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Component

@Component
class TokenV2Service(
    @Autowired(required = false)
    private val jwtDecoder: JwtDecoder? = null
) {
    fun verifyLegacyToken(token: String): LegacyToken? {
        val decoder = jwtDecoder ?: return null
        val jwt = try {
            decoder.decode(token)
        } catch (e: Exception) {
            return null
        }
        val id = jwt.subject?.toIntOrNull() ?: return null
        return LegacyToken(id, jwt.getClaimAsString("username") ?: "")
    }
}
