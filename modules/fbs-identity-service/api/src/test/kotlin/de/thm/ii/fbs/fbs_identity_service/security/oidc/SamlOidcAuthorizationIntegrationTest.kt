package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.endsWith
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = [
        "app.saml.enabled=true",
        "app.saml.registration-id=keycloak"
    ]
)
class SamlOidcAuthorizationIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setUp() {
        userRepository.findByUsername("saml-oidc-test-user")?.let { userRepository.delete(it) }

        userRepository.save(
            UserEntity(
                prename = "Saml",
                surname = "User",
                email = "saml-user@example.org",
                username = "saml-oidc-test-user",
                password = passwordEncoder.encode("secret"),
                privacyChecked = true,
                deleted = false,
                alias = null,
                globalRole = GlobalRole.USER.id
            )
        )
    }

    @AfterEach
    fun tearDown() {
        userRepository.findByUsernameAndDeletedFalse("saml-oidc-test-user")
            ?.let { userRepository.delete(it) }
    }

    @Test
    fun `unauthenticated oidc authorize request with saml enabled automatically redirects to saml login skipping login form`() {
        val session = MockHttpSession()

        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid profile")
            queryParam("code_challenge", "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q")
            queryParam("code_challenge_method", "S256")
            queryParam("state", "saml-state")
            this.session = session
        }.andExpect {
            status { is3xxRedirection() }
            header {
                string("Location", endsWith("/saml2/authenticate/keycloak"))
            }
        }
    }

    @Test
    fun `authenticated user on oidc authorize request bypasses saml login and redirects to client callback`() {
        mockMvc.get("/oauth2/authorize") {
            with(user("saml-oidc-test-user").roles("USER"))
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid profile")
            queryParam("code_challenge", "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q")
            queryParam("code_challenge_method", "S256")
            queryParam("state", "authenticated-state")
        }.andExpect {
            status { is3xxRedirection() }
            header {
                string("Location", containsString("http://127.0.0.1:4200/oauth2/callback"))
                string("Location", containsString("code="))
                string("Location", containsString("state=authenticated-state"))
            }
        }
    }
}

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = [
        "app.saml.enabled=true",
        "app.saml.registration-id=thm"
    ]
)
class CustomSamlRegistrationOidcIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `unauthenticated oidc authorize request with custom saml registration id redirects to custom saml login`() {
        val session = MockHttpSession()

        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid profile")
            queryParam("code_challenge", "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q")
            queryParam("code_challenge_method", "S256")
            queryParam("state", "saml-state")
            this.session = session
        }.andExpect {
            status { is3xxRedirection() }
            header {
                string("Location", endsWith("/saml2/authenticate/thm"))
            }
        }
    }
}
