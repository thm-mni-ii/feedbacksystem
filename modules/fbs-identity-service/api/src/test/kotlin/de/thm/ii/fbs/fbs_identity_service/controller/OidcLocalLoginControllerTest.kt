package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.security.local.OidcLocalLoginService
import de.thm.ii.fbs.fbs_identity_service.security.ratelimit.ClientIpResolver
import de.thm.ii.fbs.fbs_identity_service.security.ratelimit.LoginAttemptService
import org.mockito.kotlin.mock
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import kotlin.test.Test
import kotlin.test.assertSame

@WebMvcTest(OidcLocalLoginController::class)
@AutoConfigureMockMvc(addFilters = false)
class OidcLocalLoginControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var oidcLocalLoginService: OidcLocalLoginService

    @MockitoBean
    private lateinit var securityContextRepository: SecurityContextRepository

    @MockitoBean
    private lateinit var loginAttemptService: LoginAttemptService

    @MockitoBean
    private lateinit var clientIpResolver: ClientIpResolver

    @Test
    fun `returns bad request when client ip cannot be determined`() {

        whenever(clientIpResolver.resolve(any())).thenReturn(null)

        mockMvc.post("/api/v1/auth/oidc-login") {
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "Paul",
              "password": "password"
            }
            """.trimIndent()
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(400) }
            jsonPath("$.error") { value("Bad Request") }
            jsonPath("$.message") { value("Failed to determine client IP") }
            jsonPath("$.path") { value("/api/v1/auth/oidc-login") }
        }

        verify(loginAttemptService, never()).isBlocked(any(), any())
        verify(loginAttemptService, never()).recordFailure(any(), any())
        verify(loginAttemptService, never()).recordSuccess(any())
        verify(oidcLocalLoginService, never()).authenticate(any(), any())
        verify(securityContextRepository, never()).saveContext(any(), any(), any())
        verify(clientIpResolver).resolve(any())
    }

    @Test
    fun `returns too many requests when rate limit is exceeded`() {
        whenever(clientIpResolver.resolve(any())).thenReturn("202.0.11.50")
        whenever(loginAttemptService.isBlocked("202.0.11.50", "Paul")).thenReturn(true)

        mockMvc.post("/api/v1/auth/oidc-login") {
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "Paul",
              "password": "password"
            }
            """.trimIndent()
        }.andExpect {
            status { isTooManyRequests() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(429) }
            jsonPath("$.error") { value("Too Many Requests") }
            jsonPath("$.message") { value("Too many failed login attempts") }
            jsonPath("$.path") { value("/api/v1/auth/oidc-login") }
        }

        verify(loginAttemptService, never()).recordFailure(any(), any())
        verify(loginAttemptService, never()).recordSuccess(any())
        verify(loginAttemptService).isBlocked("202.0.11.50", "Paul")
        verify(oidcLocalLoginService, never()).authenticate(any(), any())
        verify(securityContextRepository, never()).saveContext(any(), any(), any())
        verify(clientIpResolver).resolve(any())
    }

    @Test
    fun `records failed login attempt when credentials are invalid`() {
        whenever(clientIpResolver.resolve(any())).thenReturn("202.0.11.50")
        whenever(loginAttemptService.isBlocked("202.0.11.50", "Paul")).thenReturn(false)
        whenever(oidcLocalLoginService.authenticate("Paul", "wrong-password"))
            .thenThrow(BadCredentialsException("Bad credentials"))

        mockMvc.post("/api/v1/auth/oidc-login") {
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "Paul",
              "password": "wrong-password"
            }
            """.trimIndent()
        }.andExpect {
            status { isUnauthorized() }
            jsonPath("$.timestamp") { exists() }
            jsonPath("$.status") { value(401) }
            jsonPath("$.error") { value("Unauthorized") }
            jsonPath("$.message") { value("Invalid username or password") }
            jsonPath("$.path") { value("/api/v1/auth/oidc-login") }
        }

        verify(loginAttemptService).isBlocked("202.0.11.50", "Paul")
        verify(loginAttemptService).recordFailure("202.0.11.50", "Paul")
        verify(loginAttemptService, never()).recordSuccess(any())
        verify(oidcLocalLoginService).authenticate("Paul", "wrong-password")
        verify(securityContextRepository, never()).saveContext(any(), any(), any())
        verify(clientIpResolver).resolve(any())
    }

    @Test
    fun `saves security context and records success when login succeeds`() {
        whenever(clientIpResolver.resolve(any())).thenReturn("202.0.11.50")
        whenever(loginAttemptService.isBlocked("202.0.11.50", "Paul")).thenReturn(false)

        val authentication = mock<Authentication>()
        whenever(oidcLocalLoginService.authenticate("Paul", "password"))
            .thenReturn(authentication)

        mockMvc.post("/api/v1/auth/oidc-login") {
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "Paul",
              "password": "password"
            }
            """.trimIndent()
        }.andExpect {
            status { is3xxRedirection() }
        }

        verify(clientIpResolver).resolve(any())
        verify(loginAttemptService).isBlocked("202.0.11.50", "Paul")
        verify(oidcLocalLoginService).authenticate("Paul", "password")
        verify(loginAttemptService).recordSuccess("Paul")

        val securityContextCaptor = argumentCaptor<SecurityContext>()

        verify(securityContextRepository).saveContext(
            securityContextCaptor.capture(),
            any(),
            any()
        )

        assertSame(authentication, securityContextCaptor.firstValue.authentication)

        verify(loginAttemptService, never()).recordFailure(any(), any())
    }
}
