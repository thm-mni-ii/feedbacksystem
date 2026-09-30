package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository

@ExtendWith(MockitoExtension::class)
class OidcClientSyncServiceTest {

    @Mock
    private lateinit var registeredClientRepository: RegisteredClientRepository

    @Mock
    private lateinit var jdbcTemplate: JdbcTemplate

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var syncService: OidcClientSyncService

    @BeforeEach
    fun setUp() {
        syncService = OidcClientSyncService(
            registeredClientRepository = registeredClientRepository,
            jdbcTemplate = jdbcTemplate,
            passwordEncoder = passwordEncoder,
            accessTokenTtlMinutes = 10,
            authorizationCodeTtlMinutes = 5
        )
    }

    @Test
    fun `syncClient saves public client with custom redirect URIs and scopes`() {
        val entity = ApplicationProviderEntity(
            id = "custom-app",
            title = "Custom App",
            icon = "school",
            url = "https://fbs-local.mni.thm.de",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.USER,
            navbarPosition = 10,
            showInNavbar = true,
            isDefault = false,
            isActive = true,
            clientId = "local",
            oidcEnabled = true,
            redirectUris = "https://fbs-local.mni.thm.de/login,https://fbs-local.mni.thm.de/oauth2/callback",
            clientType = "PUBLIC",
            scopes = "openid,profile,email"
        )

        whenever(registeredClientRepository.findByClientId("local")).thenReturn(null)

        syncService.syncClient(entity)

        verify(registeredClientRepository).save(argThat {
            clientId == "local" &&
            clientAuthenticationMethods.contains(ClientAuthenticationMethod.NONE) &&
            scopes.containsAll(listOf("openid", "profile", "email")) &&
            redirectUris.containsAll(listOf("https://fbs-local.mni.thm.de/login", "https://fbs-local.mni.thm.de/oauth2/callback")) &&
            clientSettings.isRequireProofKey
        })
    }

    @Test
    fun `syncClient derives default redirect URIs from url when not explicitly specified`() {
        val entity = ApplicationProviderEntity(
            id = "auto-app",
            title = "Auto App",
            icon = "terminal",
            url = "https://sub.feedback.thm.de",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.USER,
            navbarPosition = 10,
            showInNavbar = true,
            isDefault = false,
            isActive = true,
            clientId = null,
            oidcEnabled = true,
            redirectUris = null
        )

        whenever(registeredClientRepository.findByClientId("auto-app")).thenReturn(null)

        syncService.syncClient(entity)

        verify(registeredClientRepository).save(argThat {
            clientId == "auto-app" &&
            redirectUris.contains("https://sub.feedback.thm.de/login") &&
            redirectUris.contains("https://sub.feedback.thm.de/oauth2/callback")
        })
    }

    @Test
    fun `deleteClient removes client from database`() {
        syncService.deleteClient("local")

        verify(jdbcTemplate).update("DELETE FROM oauth2_registered_client WHERE client_id = ?", "local")
    }
}
