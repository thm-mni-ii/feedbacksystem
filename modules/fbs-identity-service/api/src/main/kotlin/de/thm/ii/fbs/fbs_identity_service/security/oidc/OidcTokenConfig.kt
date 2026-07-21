package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.security.local.IdentityUserPrincipal
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer

@Configuration
class OidcTokenConfig {

    @Bean
    fun jwtTokenCustomizer(): OAuth2TokenCustomizer<JwtEncodingContext> {
        return OAuth2TokenCustomizer { context ->
            val principal = context.getPrincipal<Authentication>().principal

            if (principal is IdentityUserPrincipal) {
                context.claims
                    .subject(principal.userId.toString())

                if (context.tokenType == OAuth2TokenType.ACCESS_TOKEN) {
                    context.claims
                        .claim("username", principal.username)
                        .claim("globalRole", principal.globalRole.name)
                }
            }
        }
    }
}
