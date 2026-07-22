package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

@SpringBootTest
@AutoConfigureMockMvc
class OidcLocalLoginIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `local oidc login authenticates user in existing session`() {
        val session = MockHttpSession()

        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam(
                "redirect_uri",
                "http://127.0.0.1:4200/oauth2/callback"
            )
            queryParam("scope", "openid profile")
            queryParam(
                "code_challenge",
                "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q"
            )
            queryParam("code_challenge_method", "S256")
            queryParam("state", "test-state")
            this.session = session
        }
            .andExpect {
                status {
                    is3xxRedirection()
                }
            }

        val loginResult = mockMvc.post("/api/v1/auth/oidc-login") {
            this.session = session
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "maxlogin",
              "password": "test123"
            }
            """.trimIndent()
        }
            .andExpect {
                status {
                    is3xxRedirection()
                }
            }
            .andReturn()

        val authorizationRedirectUrl = requireNotNull(loginResult.response.redirectedUrl)

        assertTrue(authorizationRedirectUrl.contains("/oauth2/authorize"))

        val securityContext = session.getAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY
        ) as SecurityContext

        assertTrue(securityContext.authentication.isAuthenticated)
        assertEquals("maxlogin", securityContext.authentication.name)

        val authorizationResult = mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam(
                "redirect_uri",
                "http://127.0.0.1:4200/oauth2/callback"
            )
            queryParam("scope", "openid profile")
            queryParam(
                "code_challenge",
                "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q"
            )
            queryParam("code_challenge_method", "S256")
            queryParam("state", "test-state")
            queryParam("continue", "")
            this.session = session
        }
            .andExpect {
                status {
                    is3xxRedirection()
                }
            }
            .andReturn()

        val callbackUrl = requireNotNull(
            authorizationResult.response.redirectedUrl
        )

        assertTrue(
            callbackUrl.startsWith(
                "http://127.0.0.1:4200/oauth2/callback"
            )
        )
        assertTrue(callbackUrl.contains("code="))
        assertTrue(callbackUrl.contains("state=test-state"))
    }

    @Test
    fun `oidc login returns unauthorized for invalid credentials`() {
        val session = MockHttpSession()

        mockMvc.post("/api/v1/auth/oidc-login") {
            this.session = session
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "maxlogin",
              "password": "wrong-password"
            }
            """.trimIndent()
        }
            .andExpect {
                status {
                    isUnauthorized()
                }
            }

        val securityContext = session.getAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY
        ) as? SecurityContext

        assertNull(securityContext)
    }
}
