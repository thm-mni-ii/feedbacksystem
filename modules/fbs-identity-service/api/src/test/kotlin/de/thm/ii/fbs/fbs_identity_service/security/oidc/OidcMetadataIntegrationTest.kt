package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.hasItems
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import kotlin.test.Test

@SpringBootTest
@AutoConfigureMockMvc
class OidcMetadataIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `openid configuration dynamically derives endpoints from request host`() {
        mockMvc.get("/.well-known/openid-configuration")
            .andExpect {
                status { isOk() }
                content {
                    contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                }
                jsonPath("$.issuer") {
                    value("http://localhost")
                }
                jsonPath("$.authorization_endpoint") {
                    value("http://localhost/oauth2/authorize")
                }
                jsonPath("$.token_endpoint") {
                    value("http://localhost/oauth2/token")
                }
                jsonPath("$.jwks_uri") {
                    value("http://localhost/oauth2/jwks")
                }
                jsonPath("$.userinfo_endpoint") {
                    value("http://localhost/userinfo")
                }
                jsonPath("$.response_types_supported") {
                    value(hasItem("code"))
                }
                jsonPath("$.code_challenge_methods_supported") {
                    value(hasItem("S256"))
                }
                jsonPath("$.scopes_supported") {
                    value(hasItems("openid", "profile"))
                }
            }
    }

    @Test
    fun `openid configuration dynamically respects reverse proxy forwarded host headers`() {
        mockMvc.get("http://localhost:8083/.well-known/openid-configuration")
            .andExpect {
                status { isOk() }
                jsonPath("$.issuer") {
                    value("http://localhost:8083")
                }
                jsonPath("$.authorization_endpoint") {
                    value("http://localhost:8083/oauth2/authorize")
                }
                jsonPath("$.token_endpoint") {
                    value("http://localhost:8083/oauth2/token")
                }
                jsonPath("$.jwks_uri") {
                    value("http://localhost:8083/oauth2/jwks")
                }
            }
    }

    @Test
    fun `jwks endpoint exposes public rsa key`() {
        mockMvc.get("/oauth2/jwks")
            .andExpect {
                status { isOk() }
                content {
                    contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                }
                jsonPath("$.keys") {
                    isArray()
                }
                jsonPath("$.keys") {
                    isNotEmpty()
                }
                jsonPath("$.keys[0].kty") {
                    value("RSA")
                }
                jsonPath("$.keys[0].kid") {
                    isNotEmpty()
                }
                jsonPath("$.keys[0].e") {
                    isNotEmpty()
                }
                jsonPath("$.keys[0].n") {
                    isNotEmpty()
                }
                jsonPath("$.keys[0].d") {
                    doesNotExist()
                }
                jsonPath("$.keys[0].p") {
                    doesNotExist()
                }
                jsonPath("$.keys[0].q") {
                    doesNotExist()
                }
            }
    }
}
