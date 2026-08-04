package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.auth.CurrentUserService
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.put


@WebMvcTest(LegalController::class)
@AutoConfigureMockMvc(addFilters = false)
class LegalControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var userService: UserService

    @MockitoBean
    private lateinit var currentUserService: CurrentUserService

    @Test
    fun `legal text returns not found for unknown filename`() {
        mockMvc.get("/api/v1/legal/unknown")
            .andExpect {
                status { isNotFound() }
                jsonPath("$.timestamp") { exists() }
                jsonPath("$.status") { value(404) }
                jsonPath("$.error") { value("Not Found") }
                jsonPath("$.message") { value("Legal text file not found") }
                jsonPath("$.path") { value("/api/v1/legal/unknown") }
            }
    }

    @Test
    fun `legal text returns impressum markdown`() {
        mockMvc.get("/api/v1/legal/impressum")
            .andExpect {
                status { isOk() }
                jsonPath("$.markdown") { exists() }
            }
    }

    @Test
    fun `terms of use status returns accepted status for current user`() {
        val user = currentUser(1L)

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(userService.getPrivacyStatusOf(1L)).thenReturn(true)

        mockMvc.get("/api/v1/legal/termsofuse/status")
            .andExpect {
                status { isOk() }
                jsonPath("$.accepted") { value(true) }
            }

        verify(userService).getPrivacyStatusOf(1L)
    }

    @Test
    fun `terms of use status returns unauthorized when user is not authenticated`() {
        whenever(currentUserService.getCurrentUser()).thenReturn(null)

        mockMvc.get("/api/v1/legal/termsofuse/status")
            .andExpect {
                status { isUnauthorized() }
                jsonPath("$.timestamp") { exists() }
                jsonPath("$.status") { value(401) }
                jsonPath("$.error") { value("Unauthorized") }
                jsonPath("$.message") { value("User is not authenticated") }
                jsonPath("$.path") { value("/api/v1/legal/termsofuse/status") }
            }

        verify(userService, never()).getPrivacyStatusOf(any())
    }

    @Test
    fun `accept terms of use updates acceptance for current user`() {
        val user = currentUser(1L)

        whenever(currentUserService.getCurrentUser()).thenReturn(user)

        mockMvc.put("/api/v1/legal/termsofuse/accept")
            .andExpect {
                status { isNoContent() }
            }

        verify(userService).updateAgreementToPrivacyFor(1L, true)
    }

    @Test
    fun `accept terms of use returns unauthorized when user is not authenticated`() {
        whenever(currentUserService.getCurrentUser()).thenReturn(null)

        mockMvc.put("/api/v1/legal/termsofuse/accept")
            .andExpect {
                status { isUnauthorized() }
                jsonPath("$.timestamp") { exists() }
                jsonPath("$.status") { value(401) }
                jsonPath("$.error") { value("Unauthorized") }
                jsonPath("$.message") { value("User is not authenticated") }
                jsonPath("$.path") { value("/api/v1/legal/termsofuse/accept") }
            }

        verify(userService, never()).updateAgreementToPrivacyFor(any(), any())
    }

    private fun currentUser(userId: Long = 1L): User {
        return User(
            id = userId,
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "niklas",
            globalRole = GlobalRole.USER,
            alias = null
        )
    }
}
