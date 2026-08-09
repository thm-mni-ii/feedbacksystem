package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import java.util.UUID
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
                tokenSettings.accessTokenTimeToLive == Duration.ofMinutes(10) &&
                tokenSettings.authorizationCodeTimeToLive == Duration.ofMinutes(5)
            }
        )
    }

    @Test
    fun `does not register client when persistent client already exists`() {
        val existingClient =
            RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("configured-client")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:9999/test-callback")
                .build()

        whenever(registeredClientRepository.findByClientId("configured-client")).thenReturn(existingClient)

        registeredClientInitializer.run(DefaultApplicationArguments())

        verify(registeredClientRepository).findByClientId("configured-client")
        verify(registeredClientRepository, never()).save(any())
    }
}
