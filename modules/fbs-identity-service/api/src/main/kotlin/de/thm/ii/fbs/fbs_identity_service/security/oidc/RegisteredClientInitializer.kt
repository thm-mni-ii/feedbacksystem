package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.core.oidc.OidcScopes
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.stereotype.Component
import java.time.Duration
import java.util.UUID

@Component
class RegisteredClientInitializer(
    private val registeredClientRepository: RegisteredClientRepository,

    @param:Value("\${security.oidc.client.id}")
    private val clientId: String,

    @param:Value("\${security.oidc.client.redirect-uri}")
    private val redirectUri: String,

    @param:Value("\${security.oidc.client.post-logout-redirect-uri:}")
    private val postLogoutRedirectUri: String = "",

    @param:Value("\${security.oidc.client.access-token-ttl-minutes}")
    private val accessTokenTtlMinutes: Long,

    @param:Value("\${security.oidc.client.authorization-code-ttl-minutes}")
    private val authorizationCodeTtlMinutes: Long
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        val clientIds = clientId.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        clientIds.forEach { cid ->
            val existing = registeredClientRepository.findByClientId(cid)
            val clientConfig = createRegisteredClient(existing?.id ?: UUID.randomUUID().toString(), cid)
            registeredClientRepository.save(clientConfig)
        }
    }

    private fun createRegisteredClient(id: String = UUID.randomUUID().toString(), targetClientId: String = clientId): RegisteredClient {
        val builder = RegisteredClient.withId(id)
            .clientId(targetClientId)
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .clientSettings(
                ClientSettings.builder()
                    .requireProofKey(true)
                    .requireAuthorizationConsent(false)
                    .build()
            )
            .tokenSettings(
                TokenSettings.builder()
                    .accessTokenTimeToLive(Duration.ofMinutes(accessTokenTtlMinutes))
                    .authorizationCodeTimeToLive(Duration.ofMinutes(authorizationCodeTtlMinutes))
                    .build()
            )

        val postLogoutUris = mutableSetOf<String>()
        if (postLogoutRedirectUri.isNotBlank()) {
            postLogoutRedirectUri.split(",").map { it.trim() }.filter { it.isNotEmpty() }.forEach { postLogoutUris.add(it) }
        }

        redirectUri.split(",").map { it.trim() }.filter { it.isNotEmpty() }.forEach { uri ->
            builder.redirectUri(uri)
            postLogoutUris.add(uri)
            try {
                val parsed = java.net.URI(uri)
                val base = "${parsed.scheme}://${parsed.authority}/"
                postLogoutUris.add(base)
            } catch (_: Exception) {}
        }

        postLogoutUris.forEach { builder.postLogoutRedirectUri(it) }

        return builder.build()
    }
}
