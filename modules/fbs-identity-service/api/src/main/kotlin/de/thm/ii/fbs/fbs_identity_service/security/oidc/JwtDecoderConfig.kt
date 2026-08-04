package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.proc.SecurityContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration

@Configuration
class JwtDecoderConfig() {

    @Bean("authorizationServerJwtDecoder")
    @Primary
    fun authorizationServerJwtDecoder(
        jwkSource: JWKSource<SecurityContext>
    ): JwtDecoder {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource)
    }
}