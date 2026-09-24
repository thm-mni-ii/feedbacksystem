package de.thm.ii.fbs.fbs_identity_service.controller

import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = [
        "app.saml.enabled=true",
        "app.saml.registration-id=thm"
    ]
)
class SamlLoginViewIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `when saml is enabled login page renders custom template with green SAML button and local login`() {
        mockMvc.get("/login")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
                // Custom template is rendered, not the plain Spring Security default login page
                content { string(not(containsString("Login with SAML 2.0"))) }
                content { string(containsString("Feedback System")) }
                // SAML button is displayed with uppercase provider key
                content { string(containsString("Login with THM")) }
                content { string(containsString("/saml2/authenticate/thm")) }
                content { string(containsString("fbs-button-sso")) }
                // Local login form is displayed below
                content { string(containsString("Local Login")) }
                content { string(containsString("username")) }
                content { string(containsString("password")) }
            }
    }
}
