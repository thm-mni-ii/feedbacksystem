package de.thm.ii.fbs.fbs_identity_service.security.oidc

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
    private val registeredClientRepository: RegisteredClientRepository
) : ApplicationRunner {

    private val clientId = "fbs-test-client"

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
            .redirectUri("http://127.0.0.1:4200/oauth2/callback")
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
                    .accessTokenTimeToLive(Duration.ofMinutes(10))
                    .authorizationCodeTimeToLive(Duration.ofMinutes(5))
                    .build()
            )
            .build()
    }
}
