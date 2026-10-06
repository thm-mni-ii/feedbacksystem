package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.fasterxml.jackson.databind.ObjectMapper
import com.nimbusds.jwt.SignedJWT
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeRequest
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringBootTest
@AutoConfigureMockMvc
class TokenExchangeIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    private lateinit var testUserEntity: UserEntity

    @BeforeEach
    fun setup() {
        testUserEntity = userRepository.save(
            UserEntity(
                username = "token_exchange_test_user",
                password = "hashedpassword",
                prename = "Exchange",
                surname = "Tester",
                email = "exchange@thm.de",
                globalRole = 2
            )
        )
    }

    @AfterEach
    fun tearDown() {
        userRepository.deleteById(testUserEntity.id)
    }

    @Test
    fun `authenticated user can exchange token for course-management audience`() {
        val request = TokenExchangeRequest("course-management")

        val result = mockMvc.post("/api/v1/auth/token/exchange") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
            with(
                jwt().jwt { jwt ->
                    jwt.subject(testUserEntity.id.toString())
                    jwt.claim("username", testUserEntity.username)
                    jwt.claim("globalRole", "USER")
                }
            )
        }.andExpect {
            status { isOk() }
            jsonPath("$.tokenType") { value("Bearer") }
            jsonPath("$.audience") { value("course-management") }
            jsonPath("$.accessToken") { isNotEmpty() }
        }.andReturn()

        val json = objectMapper.readTree(result.response.contentAsString)
        val tokenString = json.get("accessToken").asText()
        assertNotNull(tokenString)

        val parsedJwt = SignedJWT.parse(tokenString)
        assertEquals(testUserEntity.id.toString(), parsedJwt.jwtClaimsSet.subject)
        assertEquals(listOf("course-management"), parsedJwt.jwtClaimsSet.audience)
        assertEquals("fbs-web-shell", parsedJwt.jwtClaimsSet.getClaim("client_id"))
        assertEquals("USER", parsedJwt.jwtClaimsSet.getClaim("globalRole"))
        assertEquals("Exchange Tester", parsedJwt.jwtClaimsSet.getClaim("name"))
    }

    @Test
    fun `unauthenticated request to token exchange endpoint is rejected`() {
        val request = TokenExchangeRequest("course-management")

        mockMvc.post("/api/v1/auth/token/exchange") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isUnauthorized() }
        }
    }
}
