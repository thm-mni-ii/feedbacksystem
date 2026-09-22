package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.security.principal.IdentityUserPrincipal
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

                val fullName = listOf(principal.prename, principal.surname)
                    .filter { it.isNotBlank() }
                    .joinToString(" ")
                    .ifBlank { principal.username }

                if (context.tokenType == OAuth2TokenType.ACCESS_TOKEN) {
                    context.claims
                        .claim("id", principal.userId)
                        .claim("userId", principal.userId)
                        .claim("username", principal.username)
                        .claim("preferred_username", principal.username)
                        .claim("globalRole", principal.globalRole.name)
                        .claim("global_role", principal.globalRole.name)
                        .claim("roles", listOf("ROLE_${principal.globalRole.name}"))
                        .claim("given_name", principal.prename)
                        .claim("family_name", principal.surname)
                        .claim("name", fullName)

                    if (!principal.email.isNullOrBlank()) {
                        context.claims.claim("email", principal.email)
                    }
                } else if (context.tokenType.value == "id_token") {
                    context.claims
                        .claim("preferred_username", principal.username)
                        .claim("given_name", principal.prename)
                        .claim("family_name", principal.surname)
                        .claim("name", fullName)

                    if (!principal.email.isNullOrBlank()) {
                        context.claims.claim("email", principal.email)
                    }
                }
            }
        }
    }
}
