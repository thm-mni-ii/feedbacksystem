package de.thm.ii.fbs.fbs_identity_service.service.app

import de.thm.ii.fbs.fbs_identity_service.dto.app.CreateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.dto.app.UpdateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.exception.ApplicationProviderAlreadyExistsException
import de.thm.ii.fbs.fbs_identity_service.exception.ApplicationProviderNotFoundException
import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.model.user.AuthSource
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.security.oidc.OidcClientSyncService
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class ApplicationProviderServiceTest {

    @Mock
    private lateinit var repository: ApplicationProviderRepository

    @Mock
    private lateinit var currentUserService: CurrentUserService

    @Mock
    private lateinit var oidcClientSyncService: OidcClientSyncService

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var service: ApplicationProviderService

    @BeforeEach
    fun setUp() {
        service = ApplicationProviderService(repository, currentUserService, oidcClientSyncService, passwordEncoder)
    }

    @Test
    fun `getVisibleProvidersForCurrentUser returns ALL for unauthenticated user`() {
        whenever(currentUserService.getCurrentUser()).thenReturn(null)
        val entity = createEntity("app-1", AppRequiredRole.ALL)
        whenever(repository.findAllByIsActiveTrueAndRequiredGlobalRoleInOrderByNavbarPositionAscTitleAsc(listOf(AppRequiredRole.ALL)))
            .thenReturn(listOf(entity))

        val result = service.getVisibleProvidersForCurrentUser()

        assertEquals(1, result.size)
        assertEquals("app-1", result[0].id)
    }

    @Test
    fun `getVisibleProvidersForCurrentUser returns ALL and USER for USER role`() {
        val user = testUser(GlobalRole.USER)
        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        val entity1 = createEntity("app-all", AppRequiredRole.ALL)
        val entity2 = createEntity("app-user", AppRequiredRole.USER)
        whenever(repository.findAllByIsActiveTrueAndRequiredGlobalRoleInOrderByNavbarPositionAscTitleAsc(listOf(AppRequiredRole.ALL, AppRequiredRole.USER)))
            .thenReturn(listOf(entity1, entity2))

        val result = service.getVisibleProvidersForCurrentUser()

        assertEquals(2, result.size)
    }

    @Test
    fun `getVisibleProvidersForCurrentUser returns ALL, USER, MODERATOR and ADMIN for ADMIN role`() {
        val user = testUser(GlobalRole.ADMIN)
        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        val entity = createEntity("app-admin", AppRequiredRole.ADMIN)
        whenever(
            repository.findAllByIsActiveTrueAndRequiredGlobalRoleInOrderByNavbarPositionAscTitleAsc(
                listOf(AppRequiredRole.ALL, AppRequiredRole.USER, AppRequiredRole.MODERATOR, AppRequiredRole.ADMIN)
            )
        ).thenReturn(listOf(entity))

        val result = service.getVisibleProvidersForCurrentUser()

        assertEquals(1, result.size)
        assertEquals("app-admin", result[0].id)
    }

    @Test
    fun `getProviderById returns provider when found`() {
        val entity = createEntity("test-app", AppRequiredRole.USER)
        whenever(repository.findById("test-app")).thenReturn(Optional.of(entity))

        val result = service.getProviderById("test-app")

        assertEquals("test-app", result.id)
    }

    @Test
    fun `getProviderById throws NotFoundException when not found`() {
        whenever(repository.findById("unknown")).thenReturn(Optional.empty())

        assertThrows<ApplicationProviderNotFoundException> {
            service.getProviderById("unknown")
        }
    }

    @Test
    fun `createProvider saves entity and returns model`() {
        val request = CreateApplicationProviderRequest(
            id = "new-app",
            title = "New App",
            description = "Description",
            icon = "school",
            url = "https://app.example.com",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.USER,
            navbarPosition = 15,
            showInNavbar = true,
            isDefault = false,
            isActive = true,
            oidcEnabled = true,
            clientId = "new-app-client",
            redirectUris = listOf("https://app.example.com/oauth2/callback")
        )

        whenever(repository.existsById("new-app")).thenReturn(false)
        whenever(repository.save(any<ApplicationProviderEntity>())).thenAnswer { invocation ->
            invocation.getArgument(0)
        }

        val result = service.createProvider(request)

        assertEquals("new-app", result.id)
        assertEquals("New App", result.title)
        assertEquals("new-app-client", result.clientId)
        assertTrue(result.oidcEnabled)
        assertEquals(listOf("https://app.example.com/oauth2/callback"), result.redirectUris)
        assertEquals(EmbedMode.IFRAME, result.embedMode)
        verify(repository).save(any<ApplicationProviderEntity>())
        verify(oidcClientSyncService).syncClient(any())
    }

    @Test
    fun `createProvider with confidential client encodes secret and stores hash in entity`() {
        val request = CreateApplicationProviderRequest(
            id = "confidential-app",
            title = "Confidential App",
            icon = "school",
            url = "https://app.example.com",
            clientType = "CONFIDENTIAL",
            clientSecret = "my-custom-secret"
        )

        whenever(repository.existsById("confidential-app")).thenReturn(false)
        whenever(passwordEncoder.encode("my-custom-secret")).thenReturn("hashed-custom-secret")
        whenever(repository.save(any<ApplicationProviderEntity>())).thenAnswer { invocation ->
            val entity = invocation.getArgument<ApplicationProviderEntity>(0)
            assertEquals("hashed-custom-secret", entity.clientSecret)
            entity
        }

        val result = service.createProvider(request)

        assertEquals("confidential-app", result.id)
        assertEquals("my-custom-secret", result.clientSecret)
        assertTrue(result.hasClientSecret)
        verify(passwordEncoder).encode("my-custom-secret")
        verify(repository).save(any<ApplicationProviderEntity>())
    }

    @Test
    fun `createProvider throws AlreadyExistsException when ID is taken`() {
        val request = CreateApplicationProviderRequest(
            id = "existing-app",
            title = "Existing App",
            icon = "school",
            url = "https://app.example.com"
        )

        whenever(repository.existsById("existing-app")).thenReturn(true)

        assertThrows<ApplicationProviderAlreadyExistsException> {
            service.createProvider(request)
        }

        verify(repository, never()).save(any())
    }

    @Test
    fun `updateProvider updates entity fields`() {
        val entity = createEntity("app-1", AppRequiredRole.USER)
        whenever(repository.findById("app-1")).thenReturn(Optional.of(entity))
        whenever(repository.save(any<ApplicationProviderEntity>())).thenAnswer { invocation ->
            invocation.getArgument(0)
        }

        val request = UpdateApplicationProviderRequest(
            title = "Updated Title",
            description = "Updated Desc",
            icon = "terminal",
            url = "https://updated.example.com",
            embedMode = EmbedMode.EXTERNAL,
            requiredGlobalRole = AppRequiredRole.ADMIN,
            navbarPosition = 5,
            showInNavbar = false,
            isDefault = true,
            isActive = true,
            oidcEnabled = true,
            clientId = "app-1-client",
            redirectUris = listOf("https://updated.example.com/login")
        )

        whenever(repository.findAll()).thenReturn(listOf(entity))

        val result = service.updateProvider("app-1", request)

        assertEquals("Updated Title", result.title)
        assertEquals("terminal", result.icon)
        assertEquals(EmbedMode.EXTERNAL, result.embedMode)
        assertEquals(AppRequiredRole.ADMIN, result.requiredGlobalRole)
        assertEquals(5, result.navbarPosition)
        assertEquals("app-1-client", result.clientId)
        assertTrue(result.oidcEnabled)
        assertFalse(result.showInNavbar)
        assertTrue(result.isDefault)
        verify(oidcClientSyncService).syncClient(any())
    }

    @Test
    fun `createProvider throws IllegalArgumentException when redirect URI is invalid or has fragment`() {
        val requestWithInvalidScheme = CreateApplicationProviderRequest(
            id = "bad-scheme-app",
            title = "Bad Scheme App",
            icon = "school",
            url = "https://app.example.com",
            redirectUris = listOf("javascript:alert(1)")
        )

        assertThrows<IllegalArgumentException> {
            service.createProvider(requestWithInvalidScheme)
        }

        val requestWithFragment = CreateApplicationProviderRequest(
            id = "bad-fragment-app",
            title = "Bad Fragment App",
            icon = "school",
            url = "https://app.example.com",
            redirectUris = listOf("https://app.example.com/oauth2/callback#fragment")
        )

        assertThrows<IllegalArgumentException> {
            service.createProvider(requestWithFragment)
        }
    }

    @Test
    fun `createProvider throws IllegalArgumentException when clientType is invalid`() {
        val request = CreateApplicationProviderRequest(
            id = "bad-type-app",
            title = "Bad Type App",
            icon = "school",
            url = "https://app.example.com",
            clientType = "INVALID_TYPE"
        )

        assertThrows<IllegalArgumentException> {
            service.createProvider(request)
        }
    }

    @Test
    fun `deleteProvider removes entity and cleans up oidc client`() {
        val entity = createEntity("app-to-delete", AppRequiredRole.ALL)
        entity.clientId = "app-to-delete-client"
        whenever(repository.findById("app-to-delete")).thenReturn(Optional.of(entity))

        val result = service.deleteProvider("app-to-delete")

        assertTrue(result)
        verify(oidcClientSyncService).deleteClient("app-to-delete-client")
        verify(repository).delete(entity)
    }

    @Test
    fun `regenerateSecret generates a new secret, updates entity to CONFIDENTIAL, and syncs oidc client`() {
        val entity = createEntity("confidential-app", AppRequiredRole.USER)
        entity.clientSecret = "hashed-old-secret"
        entity.clientType = "CONFIDENTIAL"
        whenever(repository.findById("confidential-app")).thenReturn(Optional.of(entity))
        whenever(passwordEncoder.encode(any())).thenReturn("hashed-new-secret")
        whenever(repository.save(any<ApplicationProviderEntity>())).thenAnswer { invocation ->
            invocation.getArgument(0)
        }

        val result = service.regenerateSecret("confidential-app")

        assertTrue(result.clientSecret != null && result.clientSecret != "hashed-old-secret")
        assertEquals("CONFIDENTIAL", result.clientType)
        assertTrue(result.oidcEnabled)
        assertEquals("hashed-new-secret", entity.clientSecret)
        verify(passwordEncoder).encode(any())
        verify(repository).save(entity)
        verify(oidcClientSyncService).syncClient(entity)
    }

    private fun createEntity(id: String, role: AppRequiredRole) = ApplicationProviderEntity(
        id = id,
        title = "Title $id",
        description = "Desc $id",
        icon = "school",
        url = "https://example.com/$id",
        embedMode = EmbedMode.IFRAME,
        requiredGlobalRole = role,
        navbarPosition = 10,
        showInNavbar = true,
        isDefault = false,
        isActive = true,
        clientId = "client-$id",
        oidcEnabled = false
    )

    private fun testUser(role: GlobalRole) = User(
        id = 1L,
        prename = "Test",
        surname = "User",
        email = "test@example.com",
        username = "testuser",
        globalRole = role,
        source = AuthSource.INTERNAL,
        hasPassword = true,
        displayName = "Test User"
    )
}
