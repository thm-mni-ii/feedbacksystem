package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlRouteService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(
    SamlLoginRedirectController::class,
    properties = [
        "app.saml.enabled=false",
        "app.saml.registration-id=keycloak"
    ]
)
@AutoConfigureMockMvc(addFilters = false)
class SamlLoginRedirectControllerDisabledTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var samlRouteService: SamlRouteService

    @Test
    fun `sso returns service unavailable when saml is disabled`() {
        mockMvc.get("/api/v1/login/sso")
            .andExpect {
                status { isServiceUnavailable() }
                jsonPath("$.timestamp") { exists() }
                jsonPath("$.status") { value(503) }
                jsonPath("$.error") { value("Service Unavailable") }
                jsonPath("$.message") { value("SAML is not enabled") }
                jsonPath("$.path") { value("/api/v1/login/sso") }
            }

        verify(samlRouteService, never()).sanitize(any())
    }
}
