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

    private lateinit var service: ApplicationProviderService

    @BeforeEach
    fun setUp() {
        service = ApplicationProviderService(repository, currentUserService)
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
            isActive = true
        )

        whenever(repository.existsById("new-app")).thenReturn(false)
        whenever(repository.save(any<ApplicationProviderEntity>())).thenAnswer { invocation ->
            invocation.getArgument(0)
        }

        val result = service.createProvider(request)

        assertEquals("new-app", result.id)
        assertEquals("New App", result.title)
        assertEquals(EmbedMode.IFRAME, result.embedMode)
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
            isActive = true
        )

        whenever(repository.findAll()).thenReturn(listOf(entity))

        val result = service.updateProvider("app-1", request)

        assertEquals("Updated Title", result.title)
        assertEquals("terminal", result.icon)
        assertEquals(EmbedMode.EXTERNAL, result.embedMode)
        assertEquals(AppRequiredRole.ADMIN, result.requiredGlobalRole)
        assertEquals(5, result.navbarPosition)
        assertFalse(result.showInNavbar)
        assertTrue(result.isDefault)
    }

    @Test
    fun `deleteProvider removes entity`() {
        val entity = createEntity("app-to-delete", AppRequiredRole.ALL)
        whenever(repository.findById("app-to-delete")).thenReturn(Optional.of(entity))

        val result = service.deleteProvider("app-to-delete")

        assertTrue(result)
        verify(repository).delete(entity)
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
        isActive = true
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
