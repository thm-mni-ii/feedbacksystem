package de.thm.ii.fbs.fbs_identity_service.controller

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(LoginViewController::class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(
    properties = [
        "app.saml.enabled=true",
        "app.saml.registration-id=keycloak"
    ]
)
class LoginViewControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `login returns 200 and renders login template with default model attributes`() {
        mockMvc.get("/login")
            .andExpect {
                status { isOk() }
                view { name("login") }
                model {
                    attribute("samlEnabled", true)
                    attribute("samlLoginUrl", "/saml2/authenticate/keycloak")
                    attribute("hasError", false)
                    attribute("hasSsoError", false)
                    attribute("hasLogout", false)
                }
            }
    }

    @Test
    fun `login with error param populates hasError attribute`() {
        mockMvc.get("/login") {
            param("error", "1")
        }.andExpect {
            status { isOk() }
            view { name("login") }
            model {
                attribute("hasError", true)
                attribute("hasSsoError", false)
                attribute("hasLogout", false)
            }
        }
    }

    @Test
    fun `login with ssoError param populates hasSsoError attribute`() {
        mockMvc.get("/login") {
            param("ssoError", "1")
        }.andExpect {
            status { isOk() }
            view { name("login") }
            model {
                attribute("hasError", false)
                attribute("hasSsoError", true)
                attribute("hasLogout", false)
            }
        }
    }

    @Test
    fun `login with logout param populates hasLogout attribute`() {
        mockMvc.get("/login") {
            param("logout", "1")
        }.andExpect {
            status { isOk() }
            view { name("login") }
            model {
                attribute("hasError", false)
                attribute("hasSsoError", false)
                attribute("hasLogout", true)
            }
        }
    }

    @Test
    fun `terms of use returns 200 and renders terms-of-use template`() {
        mockMvc.get("/legal/terms-of-use")
            .andExpect {
                status { isOk() }
                view { name("terms-of-use") }
                model {
                    attributeExists("privacyText")
                }
            }
    }

    @Test
    fun `terms of use alias endpoint returns 200 and renders terms-of-use template`() {
        mockMvc.get("/legal/termsofuse")
            .andExpect {
                status { isOk() }
                view { name("terms-of-use") }
                model {
                    attributeExists("privacyText")
                }
            }
    }
}
