package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.argThat
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import java.time.Duration

class RegisteredClientInitializerTest {

    private val registeredClientRepository = mock<RegisteredClientRepository>()

    private val registeredClientInitializer = RegisteredClientInitializer(
        registeredClientRepository,
        clientId = "configured-client",
        redirectUri = "http://localhost:9999/test-callback",
        accessTokenTtlMinutes = 10,
        authorizationCodeTtlMinutes = 5
    )

    @Test
    fun `registers client with configured values when persistent client does not exist`() {
        whenever(registeredClientRepository.findByClientId("configured-client")).thenReturn(null)

        registeredClientInitializer.run(DefaultApplicationArguments())

        verify(registeredClientRepository).findByClientId("configured-client")
        verify(registeredClientRepository).save(
            argThat {
                clientId == "configured-client" &&
                redirectUris.contains("http://localhost:9999/test-callback") &&
                postLogoutRedirectUris.contains("http://localhost:9999/") &&
                tokenSettings.accessTokenTimeToLive == Duration.ofMinutes(10) &&
                tokenSettings.authorizationCodeTimeToLive == Duration.ofMinutes(5)
            }
        )
    }

    @Test
    fun `updates existing client with configured values when persistent client already exists`() {
        val existingId = "existing-client-uuid-1234"
        val existingClient =
            RegisteredClient.withId(existingId)
                .clientId("configured-client")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8888/old-callback")
                .build()

        whenever(registeredClientRepository.findByClientId("configured-client")).thenReturn(existingClient)

        registeredClientInitializer.run(DefaultApplicationArguments())

        verify(registeredClientRepository).findByClientId("configured-client")
        verify(registeredClientRepository).save(
            argThat {
                id == existingId &&
                clientId == "configured-client" &&
                redirectUris.contains("http://localhost:9999/test-callback") &&
                postLogoutRedirectUris.contains("http://localhost:9999/") &&
                tokenSettings.accessTokenTimeToLive == Duration.ofMinutes(10) &&
                tokenSettings.authorizationCodeTimeToLive == Duration.ofMinutes(5)
            }
        )
    }
}
