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

class RegisteredClientInitializerTest {

    private val registeredClientRepository = mock<RegisteredClientRepository>()

    private val registeredClientInitializer = RegisteredClientInitializer(registeredClientRepository)

    @Test
    fun `registers client when persistent client does not exist`() {
        whenever(registeredClientRepository.findByClientId("fbs-test-client")).thenReturn(null)

        registeredClientInitializer.run(DefaultApplicationArguments())

        verify(registeredClientRepository).findByClientId("fbs-test-client")
        verify(registeredClientRepository).save(
            argThat {
                clientId == "fbs-test-client"
            }
        )
    }

    @Test
    fun `does not register client when persistent client already exists`() {
        val existingClient =
            RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("fbs-test-client")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://127.0.0.1:4200/oauth2/callback")
                .build()

        whenever(registeredClientRepository.findByClientId("fbs-test-client")).thenReturn(existingClient)

        registeredClientInitializer.run(DefaultApplicationArguments())

        verify(registeredClientRepository).findByClientId("fbs-test-client")
        verify(registeredClientRepository, never()).save(any())
    }
}
