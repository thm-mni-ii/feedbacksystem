package de.thm.ii.fbs.fbs_identity_service.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginRequest
import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.exception.InvalidCredentialsException
import de.thm.ii.fbs.fbs_identity_service.service.auth.LocalLoginService
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.junit.jupiter.api.Test
import org.mockito.Mockito.never
import org.mockito.kotlin.any
import org.mockito.kotlin.verify

@WebMvcTest(AuthController::class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

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

        val request = LoginRequest("niklas", "password")

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
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
            InvalidCredentialsException()
        )

        val request = LoginRequest("niklas", "wrong-password")

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isUnauthorized() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(401) }
            jsonPath("$.error") { value("Unauthorized") }
            jsonPath("$.message") { value("Invalid username or password") }
            jsonPath("$.path") { value("/api/v1/auth/login") }
        }
    }

    @Test
    fun `login returns bad request when username is blank`() {

        val request = LoginRequest("", "password")

        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(400) }
            jsonPath("$.error") { value("Bad Request") }
            jsonPath("$.message") { value("username: must not be blank") }
            jsonPath("$.path") { value("/api/v1/auth/login") }
        }
        verify(localLoginService, never()).login(any(), any())
    }

    @Test
    fun `login returns bad request when password is blank`() {

        val request = LoginRequest("niklas", "")
        mockMvc.post("/api/v1/auth/login"){
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(400) }
            jsonPath("$.error") { value("Bad Request") }
            jsonPath("$.message") { value("password: must not be blank") }
            jsonPath("$.path") { value("/api/v1/auth/login") }
        }
        verify(localLoginService, never()).login(any(), any())
    }

    @Test
    fun `login returns bad request when request body is malformed`() {
        mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"""
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(400) }
            jsonPath("$.error") { value("Bad Request") }
            jsonPath("$.message") { value("Malformed request body") }
            jsonPath("$.path") { value("/api/v1/auth/login") }
        }

        verify(localLoginService, never()).login(any(), any())
    }
}
