package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.hasItem
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.net.URI
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringBootTest
@AutoConfigureMockMvc
class UserInfoEndpointIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val testUsername = "userinfo-test-user"
    private val testPassword = "userinfo-pass-123"

    @BeforeEach
    fun setUp() {
        userRepository.findByUsername(testUsername)?.let { userRepository.delete(it) }

        userRepository.save(
            UserEntity(
                prename = "Userinfo",
                surname = "Tester",
                email = "userinfo.tester@thm.de",
                username = testUsername,
                password = passwordEncoder.encode(testPassword),
                privacyChecked = true,
                deleted = false,
                alias = null,
                globalRole = GlobalRole.USER.id
            )
        )
    }

    @AfterEach
    fun tearDown() {
        userRepository.findByUsernameAndDeletedFalse(testUsername)
            ?.let { userRepository.delete(it) }
    }

    @Test
    fun `userinfo endpoint returns 401 unauthorized when unauthenticated`() {
        mockMvc.get("/userinfo") {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isUnauthorized() }
            header {
                string("WWW-Authenticate", containsString("Bearer"))
            }
        }
    }

    @Test
    fun `userinfo endpoint returns 401 unauthorized for invalid bearer token`() {
        mockMvc.get("/userinfo") {
            header("Authorization", "Bearer invalid-or-forged-token")
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isUnauthorized() }
            header {
                string("WWW-Authenticate", containsString("error=\"invalid_token\""))
            }
        }
    }

    @Test
    fun `full oidc authorization code flow issues access token that validates successfully at userinfo endpoint`() {
        val session = MockHttpSession()
        val codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        // S256 hash for dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk is E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
        val codeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

        // 1. Initiate authorization request to establish saved request
        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid profile email")
            queryParam("code_challenge", codeChallenge)
            queryParam("code_challenge_method", "S256")
            queryParam("state", "test-state-userinfo")
            this.session = session
        }.andExpect {
            status { is3xxRedirection() }
        }

        // 2. Authenticate user in session via oidc-login
        val loginResult = mockMvc.post("/api/v1/auth/oidc-login") {
            with(csrf())
            this.session = session
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"$testUsername","password":"$testPassword"}"""
        }.andExpect {
            status { is3xxRedirection() }
        }.andReturn()

        val authorizationRedirectUrl = requireNotNull(loginResult.response.redirectedUrl)

        // 3. Follow redirect to authorization endpoint to receive authorization code
        val authResult = mockMvc.get(URI.create(authorizationRedirectUrl)) {
            this.session = session
        }.andExpect {
            status { is3xxRedirection() }
        }.andReturn()

        val callbackUrl = requireNotNull(authResult.response.redirectedUrl)
        assertTrue(callbackUrl.contains("code="))

        val authCode = callbackUrl.substringAfter("code=").substringBefore("&")
        val decodedAuthCode = URLDecoder.decode(authCode, StandardCharsets.UTF_8)

        // 4. Exchange authorization code for tokens
        val tokenResponse = mockMvc.post("/oauth2/token") {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
            param("grant_type", "authorization_code")
            param("client_id", "fbs-test-client")
            param("code", decodedAuthCode)
            param("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            param("code_verifier", codeVerifier)
        }.andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith(MediaType.APPLICATION_JSON) }
            jsonPath("$.access_token") { isNotEmpty() }
            jsonPath("$.id_token") { isNotEmpty() }
        }.andReturn()

        val tokenJson = objectMapper.readTree(tokenResponse.response.contentAsString)
        val accessToken = tokenJson.get("access_token").asText()
        assertNotNull(accessToken)

        // 5. Query userinfo endpoint using access token
        mockMvc.get("/userinfo") {
            header("Authorization", "Bearer $accessToken")
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith(MediaType.APPLICATION_JSON) }
            jsonPath("$.sub") { isNotEmpty() }
            jsonPath("$.email") { value("userinfo.tester@thm.de") }
            jsonPath("$.preferred_username") { value(testUsername) }
            jsonPath("$.username") { value(testUsername) }
            jsonPath("$.name") { value("Userinfo Tester") }
            jsonPath("$.globalRole") { value("USER") }
            jsonPath("$.roles") { value(hasItem("ROLE_USER")) }
        }
    }
}
