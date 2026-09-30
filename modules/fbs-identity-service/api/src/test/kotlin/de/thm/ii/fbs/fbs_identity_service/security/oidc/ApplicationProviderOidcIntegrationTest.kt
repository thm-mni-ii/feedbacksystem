package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.fbs_identity_service.dto.app.CreateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.service.app.ApplicationProviderService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationProviderOidcIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var applicationProviderService: ApplicationProviderService

    @Autowired
    private lateinit var applicationProviderRepository: ApplicationProviderRepository

    @Autowired
    private lateinit var registeredClientRepository: RegisteredClientRepository

    @AfterEach
    fun tearDown() {
        if (applicationProviderRepository.existsById("dynamic-local-app")) {
            applicationProviderService.deleteProvider("dynamic-local-app")
        }
    }

    @Test
    @WithMockUser(username = "admin", roles = ["ADMIN"])
    fun `creating application provider with oidc enables oauth2 authorization endpoint`() {
        val request = CreateApplicationProviderRequest(
            id = "dynamic-local-app",
            title = "Local Test App",
            description = "App for local development",
            icon = "school",
            url = "https://fbs-local.mni.thm.de/login",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.USER,
            navbarPosition = 10,
            showInNavbar = true,
            isDefault = false,
            isActive = true,
            clientId = "local",
            oidcEnabled = true,
            redirectUris = listOf("https://fbs-local.mni.thm.de/login"),
            scopes = listOf("openid", "profile", "email")
        )

        applicationProviderService.createProvider(request)

        val registeredClient = registeredClientRepository.findByClientId("local")
        assertNotNull(registeredClient, "Client 'local' should be registered in repository")
        assertTrue(registeredClient.redirectUris.contains("https://fbs-local.mni.thm.de/login"))
        assertTrue(registeredClient.scopes.containsAll(listOf("openid", "profile", "email")))

        // Test the exact request the user had (which previously returned 400 Bad Request)
        // With valid client_id and redirect_uri, Spring Authorization Server should redirect to /login (302) instead of 400
        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "local")
            queryParam("redirect_uri", "https://fbs-local.mni.thm.de/login")
            queryParam("scope", "openid profile email")
            queryParam("state", "x9frj0tM59WltWrjxbE-EzHP8G34HYQ-SVk3uo_Togg")
            queryParam("code_challenge", "vBeFs-jqqxcf63Sfwd01poHf4rZ1ZuDhsfIl6wvnlp0")
            queryParam("code_challenge_method", "S256")
        }.andExpect {
            status { is3xxRedirection() }
            header {
                string("Location", org.hamcrest.Matchers.containsString("/login"))
            }
        }
    }
}
