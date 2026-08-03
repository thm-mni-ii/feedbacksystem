package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import de.thm.ii.fbs.fbs_identity_service.security.config.PasswordConfig
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.net.URI
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

@SpringBootTest
@AutoConfigureMockMvc
class OidcLocalLoginIntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setUp() {
        if (!userRepository.existsByUsername("oidc-integration-test-user")) {
            userRepository.save(
                UserEntity(
                    prename = "Theo",
                    surname = "Theo",
                    email = "theo@example.org",
                    username = "oidc-integration-test-user",
                    password = passwordEncoder.encode("test123"),
                    privacyChecked = true,
                    deleted = false,
                    alias = null,
                    globalRole = GlobalRole.USER.id
                )
            )
        }
    }

    @AfterEach
    fun tearDown() {
        userRepository.findByUsernameAndDeletedFalse("oidc-integration-test-user")
            ?.let { userRepository.delete(it) }
    }

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
              "username": "oidc-integration-test-user",
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
        assertEquals("oidc-integration-test-user", securityContext.authentication.name)

        val authorizationResult = mockMvc.perform(
            MockMvcRequestBuilders
                .get(URI.create(authorizationRedirectUrl))
                .session(session)
        )
            .andExpect(
                MockMvcResultMatchers.status().is3xxRedirection
            )
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
    fun `protected request does not replace saved oidc authorization request`() {
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
                status { is3xxRedirection() }
            }

        mockMvc.get("/api/v1/legal/termsofuse/status") {
            this.session = session
        }

        val loginResult = mockMvc.post("/api/v1/auth/oidc-login") {
            this.session = session
            contentType = MediaType.APPLICATION_JSON
            content =
                """
            {
              "username": "oidc-integration-test-user",
              "password": "test123"
            }
            """.trimIndent()
        }
            .andExpect {
                status { is3xxRedirection() }
            }
            .andReturn()

        val redirectUrl = requireNotNull(
            loginResult.response.redirectedUrl
        )

        assertTrue(
            redirectUrl.contains("/oauth2/authorize")
        )

        assertFalse(
            redirectUrl.contains("/api/v1/legal/termsofuse/status")
        )
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
              "username": "oidc-integration-test-user",
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
