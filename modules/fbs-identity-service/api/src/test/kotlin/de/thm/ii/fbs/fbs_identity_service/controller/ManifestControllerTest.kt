package de.thm.ii.fbs.fbs_identity_service.controller

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.util.Properties

@WebMvcTest(ManifestController::class)
@AutoConfigureMockMvc(addFilters = false)
@Import(BuildPropertiesTestConfig::class)
class ManifestControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `manifest returns service metadata endpoints and capabilities`() {
        mockMvc.get("/manifest")
            .andExpect {
                status { isOk() }

                jsonPath("$.build.name") { value("fbs-identity-service") }
                jsonPath("$.build.version") { value("0.0.1-SNAPSHOT") }
                jsonPath("$.build.time") { value("2026-07-12T16:55:27.620Z") }
                jsonPath("$.description") { value("Provides authentication, user management and identity functions for the FBS.")}
                jsonPath("$.endpoints.health") { value("/health") }
                jsonPath("$.endpoints.manifest") { value("/manifest") }
                jsonPath("$.endpoints.graphql") { value("/graphql") }

                jsonPath("$.capabilities") { isArray() }
                jsonPath("$.capabilities.length()") { value(13) }

                jsonPath("$.capabilities[?(@.id == 'identity.auth.local-login' && @.method == 'POST' && @.path == '/api/v1/auth/login')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.legal.text.read' && @.method == 'GET' && @.path == '/api/v1/legal/{filename}')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.auth.saml-login.start' && @.requiresConfig == 'app.saml.enabled=true')]") { exists() }

                jsonPath("$.capabilities[?(@.id == 'identity.user.current.read' && @.operation == 'currentUser' && @.endpoint == '/graphql')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.user.search' && @.operation == 'users' && @.requiredRole == 'ADMIN')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.user.create' && @.operation == 'createUser' && @.requiredRole == 'ADMIN')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.user.password.change-own' && @.operation == 'changeOwnPassword' && @.requiresAuthentication == true)]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.user.global-role.update' && @.operation == 'updateGlobalRole' && @.requiredRole == 'ADMIN')]") { exists() }
                jsonPath("$.capabilities[?(@.id == 'identity.user.deactivate' && @.operation == 'deactivateUser' && @.requiredRole == 'ADMIN')]") { exists() }
            }
    }
}

@TestConfiguration
class BuildPropertiesTestConfig {

    @Bean
    fun buildProperties(): BuildProperties {
        val properties = Properties().apply {
            setProperty("name", "fbs-identity-service")
            setProperty("version", "0.0.1-SNAPSHOT")
            setProperty("time", "2026-07-12T16:55:27.620Z")
        }

        return BuildProperties(properties)
    }
}
