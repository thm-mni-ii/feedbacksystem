package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.core.oidc.OidcScopes
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.stereotype.Service
import java.net.URI
import java.time.Duration
import java.util.UUID

@Service
class OidcClientSyncService(
    private val registeredClientRepository: RegisteredClientRepository,
    private val jdbcTemplate: JdbcTemplate,
    private val passwordEncoder: PasswordEncoder,

    @param:Value("\${security.oidc.client.access-token-ttl-minutes:10}")
    private val accessTokenTtlMinutes: Long = 10,

    @param:Value("\${security.oidc.client.authorization-code-ttl-minutes:5}")
    private val authorizationCodeTtlMinutes: Long = 5
) {
    private val logger = LoggerFactory.getLogger(OidcClientSyncService::class.java)

    fun syncClient(provider: ApplicationProviderEntity) {
        val targetClientId = provider.clientId?.trim()?.ifBlank { null }
            ?: (if (provider.oidcEnabled) provider.id.trim() else return)

        val isConfidential = provider.clientType.equals("CONFIDENTIAL", ignoreCase = true)
        val existing = registeredClientRepository.findByClientId(targetClientId)
        val clientId = existing?.id ?: UUID.randomUUID().toString()

        val builder = RegisteredClient.withId(clientId)
            .clientId(targetClientId)
            .clientName(provider.title)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)

        if (isConfidential) {
            builder.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            builder.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
            if (!provider.clientSecret.isNullOrBlank()) {
                val secret = provider.clientSecret!!.trim()
                val encodedSecret = if (secret.startsWith("{") || secret.startsWith("$2")) secret else passwordEncoder.encode(secret)
                builder.clientSecret(encodedSecret)
            }
        } else {
            builder.clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
        }

        val rawScopes = provider.scopes.toCleanList()
        val scopes = if (rawScopes.isEmpty()) listOf(OidcScopes.OPENID, OidcScopes.PROFILE, OidcScopes.EMAIL) else rawScopes
        scopes.forEach { builder.scope(it) }

        builder.clientSettings(
            ClientSettings.builder()
                .requireProofKey(true)
                .requireAuthorizationConsent(false)
                .build()
        )
        builder.tokenSettings(
            TokenSettings.builder()
                .accessTokenTimeToLive(Duration.ofMinutes(accessTokenTtlMinutes))
                .authorizationCodeTimeToLive(Duration.ofMinutes(authorizationCodeTtlMinutes))
                .build()
        )

        val redirectUris = mutableSetOf<String>()
        val configuredRedirectUris = provider.redirectUris.toCleanList()
        if (configuredRedirectUris.isNotEmpty()) {
            redirectUris.addAll(configuredRedirectUris)
        } else if (provider.url.isNotBlank() && (provider.url.startsWith("http://") || provider.url.startsWith("https://"))) {
            val cleanUrl = provider.url.trim().removeSuffix("/")
            redirectUris.add(cleanUrl)
            redirectUris.add("$cleanUrl/login")
            redirectUris.add("$cleanUrl/oauth2/callback")
        }

        redirectUris.forEach { builder.redirectUri(it) }

        val postLogoutUris = mutableSetOf<String>()
        val configuredPostLogoutUris = provider.postLogoutRedirectUris.toCleanList()
        if (configuredPostLogoutUris.isNotEmpty()) {
            postLogoutUris.addAll(configuredPostLogoutUris)
        } else {
            redirectUris.forEach { uri ->
                try {
                    val parsed = URI(uri)
                    if (parsed.scheme != null && parsed.authority != null) {
                        postLogoutUris.add("${parsed.scheme}://${parsed.authority}/")
                    }
                } catch (_: Exception) {}
            }
        }

        postLogoutUris.forEach { builder.postLogoutRedirectUri(it) }

        try {
            val client = builder.build()
            registeredClientRepository.save(client)
            logger.info("Successfully synchronized OIDC client '$targetClientId' for provider '${provider.id}'")
        } catch (e: Exception) {
            logger.error("Failed to synchronize OIDC client '$targetClientId' for provider '${provider.id}'", e)
            throw e
        }
    }

    fun deleteClient(clientId: String) {
        try {
            jdbcTemplate.update("DELETE FROM oauth2_registered_client WHERE client_id = ?", clientId)
            logger.info("Successfully deleted OIDC client '$clientId'")
        } catch (e: Exception) {
            logger.error("Failed to delete OIDC client '$clientId'", e)
        }
    }
}
