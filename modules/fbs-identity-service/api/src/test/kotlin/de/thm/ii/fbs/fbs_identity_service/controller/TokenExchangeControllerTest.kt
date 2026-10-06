package de.thm.ii.fbs.fbs_identity_service.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeRequest
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeResponse
import de.thm.ii.fbs.fbs_identity_service.service.auth.TokenExchangeService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@WebMvcTest(TokenExchangeController::class)
@AutoConfigureMockMvc(addFilters = false)
class TokenExchangeControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var tokenExchangeService: TokenExchangeService

    @Test
    fun `exchangeToken returns 200 and token payload on valid request`() {
        val request = TokenExchangeRequest("course-management")
        val response = TokenExchangeResponse(
            accessToken = "mock.jwt.token",
            tokenType = "Bearer",
            expiresIn = 600,
            audience = "course-management"
        )

        whenever(tokenExchangeService.exchangeToken(any())).thenReturn(response)

        mockMvc.post("/api/v1/auth/token/exchange") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isOk() }
            jsonPath("$.accessToken") { value("mock.jwt.token") }
            jsonPath("$.tokenType") { value("Bearer") }
            jsonPath("$.expiresIn") { value(600) }
            jsonPath("$.audience") { value("course-management") }
        }

        verify(tokenExchangeService).exchangeToken(request)
    }

    @Test
    fun `exchangeToken returns 400 when targetAudience is blank`() {
        val request = TokenExchangeRequest("")

        mockMvc.post("/api/v1/auth/token/exchange") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isBadRequest() }
        }
    }
}
