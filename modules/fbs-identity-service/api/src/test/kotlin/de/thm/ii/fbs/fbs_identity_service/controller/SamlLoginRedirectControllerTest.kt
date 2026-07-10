package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlRouteService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(
    SamlLoginRedirectController::class,
    properties = [
        "app.saml.enabled=true",
        "app.saml.registration-id=keycloak"
    ]
)
@AutoConfigureMockMvc(addFilters = false)
class SamlLoginRedirectControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var samlRouteService: SamlRouteService

    @Test
    fun `sso redirects to saml authentication endpoint without route`() {
        whenever(samlRouteService.sanitize(null)).thenReturn(null)

        mockMvc.get("/api/v1/login/sso")
            .andExpect {
                status { is3xxRedirection() }
                redirectedUrl("/saml2/authenticate/keycloak")
            }

        verify(samlRouteService).sanitize(null)
    }

    @Test
    fun `sso redirects to saml authentication endpoint with sanitized route`() {
        whenever(samlRouteService.sanitize("/courses/123")).thenReturn("/courses/123")

        mockMvc.get("/api/v1/login/sso") {
        param("route", "/courses/123")
    }.andExpect {
                status { is3xxRedirection() }
                redirectedUrl("/saml2/authenticate/keycloak?route=/courses/123")
            }

        verify(samlRouteService).sanitize("/courses/123")
    }

    @Test
    fun `sso ignores invalid route`() {
        whenever(samlRouteService.sanitize("//evil.com")).thenReturn(null)

        mockMvc.get("/api/v1/login/sso") {
            param("route", "//evil.com")
        }.andExpect {
            status { is3xxRedirection() }
            redirectedUrl("/saml2/authenticate/keycloak")
        }

        verify(samlRouteService).sanitize("//evil.com")
    }
}
