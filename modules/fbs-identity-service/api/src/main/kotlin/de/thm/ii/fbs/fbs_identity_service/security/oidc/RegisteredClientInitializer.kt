package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList
import org.slf4j.LoggerFactory
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
    private val applicationProviderRepository: ApplicationProviderRepository,
    private val oidcClientSyncService: OidcClientSyncService,

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

    private val logger = LoggerFactory.getLogger(RegisteredClientInitializer::class.java)

    override fun run(args: ApplicationArguments) {
        val clientIds = clientId.toCleanList()
        clientIds.forEach { cid ->
            val existing = registeredClientRepository.findByClientId(cid)
            val clientConfig = createRegisteredClient(existing?.id ?: UUID.randomUUID().toString(), cid)
            registeredClientRepository.save(clientConfig)
        }

        try {
            val providers = applicationProviderRepository.findAll()
            providers.forEach { provider ->
                if (provider.oidcEnabled || !provider.clientId.isNullOrBlank()) {
                    oidcClientSyncService.syncClient(provider)
                }
            }
        } catch (e: Exception) {
            logger.warn("Could not sync application providers on startup: ${e.message}")
        }
    }

    private fun createRegisteredClient(id: String = UUID.randomUUID().toString(), targetClientId: String = clientId): RegisteredClient {
        val builder = RegisteredClient.withId(id)
            .clientId(targetClientId)
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .scope(OidcScopes.EMAIL)
            .scope("offline_access")
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
                    .refreshTokenTimeToLive(Duration.ofDays(30))
                    .reuseRefreshTokens(true)
                    .build()
            )

        val postLogoutUris = mutableSetOf<String>()
        if (postLogoutRedirectUri.isNotBlank()) {
            postLogoutRedirectUri.toCleanList().forEach { postLogoutUris.add(it) }
        }

        redirectUri.toCleanList().forEach { uri ->
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
