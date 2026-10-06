package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.security.principal.IdentityUserPrincipal
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer

@Configuration
class OidcTokenConfig(
    private val applicationProviderRepository: ApplicationProviderRepository,
    @param:Value("\${security.oidc.client.id:fbs-web-shell}")
    private val configuredClientIds: String
) {

    @Bean
    fun jwtTokenCustomizer(): OAuth2TokenCustomizer<JwtEncodingContext> {
        val baseInternalClients = configuredClientIds.toCleanList().toSet()

        return OAuth2TokenCustomizer { context ->
            val principal = context.getPrincipal<Authentication>().principal

            if (principal is IdentityUserPrincipal) {
                val clientId = context.registeredClient?.clientId
                val isInternal = isInternalClient(clientId, baseInternalClients)

                val subjectValue = if (isInternal) principal.userId.toString() else principal.username
                context.claims.subject(subjectValue)

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
                }
            }
        }
    }

    private fun isInternalClient(clientId: String?, baseInternalClients: Set<String>): Boolean {
        if (clientId.isNullOrBlank()) return false
        if (baseInternalClients.contains(clientId)) return true
        return try {
            val provider = applicationProviderRepository.findByClientId(clientId)
                ?: applicationProviderRepository.findById(clientId).orElse(null)
            provider?.isInternal == true
        } catch (_: Exception) {
            false
        }
    }
}

