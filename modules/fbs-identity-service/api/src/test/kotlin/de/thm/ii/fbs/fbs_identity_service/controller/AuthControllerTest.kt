package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.service.auth.LocalLoginService
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.web.server.ResponseStatusException
import org.junit.jupiter.api.Test

@WebMvcTest(AuthController::class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var localLoginService: LocalLoginService

    @Test
    fun `login returns access token for valid request`() {
        whenever(localLoginService.login("niklas", "password")).thenReturn(
            LoginResponse(
                accessToken = "jwt-token",
                tokenType = "Bearer",
                expiresIn = 3600
            )
        )

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                "username": "niklas",
                "password": "password"
                }
            """.trimIndent()
        }.andExpect {
            status { isOk() }
            jsonPath("$.accessToken") { value("jwt-token") }
            jsonPath("$.tokenType") { value("Bearer") }
            jsonPath("$.expiresIn") { value(3600) }
        }
    }

    @Test
    fun `login returns unauthorized when password is invalid`() {
        whenever(localLoginService.login("niklas", "wrong-password")).thenThrow(
            ResponseStatusException(HttpStatus.UNAUTHORIZED)
        )

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                "username": "niklas",
                "password": "wrong-password"
                }
            """.trimIndent()
        }.andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    fun `login returns bad request when username is blank`() {
        whenever(localLoginService.login("", "password")).thenThrow(
            ResponseStatusException(HttpStatus.UNAUTHORIZED)
        )

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                "username": "",
                "password": "password"
                }
            """.trimIndent()
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `login returns bad request when password is blank`() {
        whenever(localLoginService.login("niklas", "")).thenThrow(
            ResponseStatusException(HttpStatus.UNAUTHORIZED)
        )

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                "username": "niklas",
                "password": ""
                }
            """.trimIndent()
        }.andExpect {
            status { isBadRequest() }
        }
    }
}