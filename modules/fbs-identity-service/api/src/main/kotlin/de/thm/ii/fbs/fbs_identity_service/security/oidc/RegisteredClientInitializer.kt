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

    @param:Value("\${security.oidc.client.access-token-ttl-minutes}")
    private val accessTokenTtlMinutes: Long,

    @param:Value("\${security.oidc.client.authorization-code-ttl-minutes}")
    private val authorizationCodeTtlMinutes: Long
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        if (registeredClientRepository.findByClientId(clientId) == null) {
            registeredClientRepository.save(createRegisteredClient())
        }
    }

    private fun createRegisteredClient(): RegisteredClient {
        return RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId(clientId)
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri(redirectUri)
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
            .build()
    }
}
