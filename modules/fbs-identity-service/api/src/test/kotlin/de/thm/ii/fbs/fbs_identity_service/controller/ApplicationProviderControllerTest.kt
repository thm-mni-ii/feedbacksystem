package de.thm.ii.fbs.fbs_identity_service.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.fbs_identity_service.dto.app.CreateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.dto.app.UpdateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.exception.ApplicationProviderNotFoundException
import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.service.app.ApplicationProviderService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@WebMvcTest(ApplicationProviderController::class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationProviderControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var applicationProviderService: ApplicationProviderService

    @Test
    fun `getVisibleApplicationProviders returns list of active providers`() {
        val provider = testProvider("course-management")
        whenever(applicationProviderService.getVisibleProvidersForCurrentUser()).thenReturn(listOf(provider))

        mockMvc.get("/api/v2/application-providers")
            .andExpect {
                status { isOk() }
                jsonPath("$[0].id") { value("course-management") }
                jsonPath("$[0].title") { value("Kurse & Aufgaben") }
                jsonPath("$[0].embedMode") { value("IFRAME") }
                jsonPath("$[0].requiredGlobalRole") { value("USER") }
            }

        verify(applicationProviderService).getVisibleProvidersForCurrentUser()
    }

    @Test
    fun `getAllApplicationProvidersAdmin returns all providers`() {
        val provider = testProvider("admin-app")
        whenever(applicationProviderService.getAllProvidersAdmin()).thenReturn(listOf(provider))

        mockMvc.get("/api/v2/admin/application-providers")
            .andExpect {
                status { isOk() }
                jsonPath("$[0].id") { value("admin-app") }
            }

        verify(applicationProviderService).getAllProvidersAdmin()
    }

    @Test
    fun `getApplicationProviderById returns provider when found`() {
        val provider = testProvider("app-1")
        whenever(applicationProviderService.getProviderById("app-1")).thenReturn(provider)

        mockMvc.get("/api/v2/admin/application-providers/app-1")
            .andExpect {
                status { isOk() }
                jsonPath("$.id") { value("app-1") }
            }

        verify(applicationProviderService).getProviderById("app-1")
    }

    @Test
    fun `getApplicationProviderById returns not found when missing`() {
        whenever(applicationProviderService.getProviderById("missing"))
            .thenThrow(ApplicationProviderNotFoundException("missing"))

        mockMvc.get("/api/v2/admin/application-providers/missing")
            .andExpect {
                status { isNotFound() }
            }
    }

    @Test
    fun `createApplicationProvider creates provider and returns 201`() {
        val request = CreateApplicationProviderRequest(
            id = "new-app",
            title = "New App",
            description = "Desc",
            icon = "school",
            url = "https://new.example.com",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.USER,
            navbarPosition = 10,
            showInNavbar = true,
            isDefault = false,
            isActive = true
        )
        val provider = testProvider("new-app")
        whenever(applicationProviderService.createProvider(any())).thenReturn(provider)

        mockMvc.post("/api/v2/admin/application-providers") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isCreated() }
            jsonPath("$.id") { value("new-app") }
        }

        verify(applicationProviderService).createProvider(any())
    }

    @Test
    fun `createApplicationProvider returns 400 on invalid input`() {
        val request = mapOf("id" to "invalid id with spaces", "title" to "")

        mockMvc.post("/api/v2/admin/application-providers") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isBadRequest() }
        }

        verify(applicationProviderService, never()).createProvider(any())
    }

    @Test
    fun `updateApplicationProvider updates provider and returns 200`() {
        val request = UpdateApplicationProviderRequest(
            title = "Updated App",
            description = "Desc",
            icon = "terminal",
            url = "https://updated.example.com",
            embedMode = EmbedMode.EXTERNAL,
            requiredGlobalRole = AppRequiredRole.ADMIN,
            navbarPosition = 5,
            showInNavbar = true,
            isDefault = true,
            isActive = true
        )
        val provider = testProvider("app-1")
        whenever(applicationProviderService.updateProvider(any(), any())).thenReturn(provider)

        mockMvc.put("/api/v2/admin/application-providers/app-1") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isOk() }
        }

        verify(applicationProviderService).updateProvider(any(), any())
    }

    @Test
    fun `deleteApplicationProvider deletes provider and returns 204`() {
        whenever(applicationProviderService.deleteProvider("app-1")).thenReturn(true)

        mockMvc.delete("/api/v2/admin/application-providers/app-1")
            .andExpect {
                status { isNoContent() }
            }

        verify(applicationProviderService).deleteProvider("app-1")
    }

    private fun testProvider(id: String) = ApplicationProvider(
        id = id,
        title = "Kurse & Aufgaben",
        description = "Verwaltung von Kursen",
        icon = "school",
        url = "https://example.com/$id",
        embedMode = EmbedMode.IFRAME,
        requiredGlobalRole = AppRequiredRole.USER,
        navbarPosition = 10,
        showInNavbar = true,
        isDefault = true,
        isActive = true
    )
}
