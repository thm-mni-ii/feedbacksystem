package de.thm.ii.fbs.fbs_identity_service.config

import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder

@Configuration
class JwtDecoderConfig(
    @param:Value("\${app.jwt.secret}")
    private val jwtSecret: String,) {


    @Bean
    fun jwtDecoder(): JwtDecoder {
        val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))

        return NimbusJwtDecoder
            .withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}