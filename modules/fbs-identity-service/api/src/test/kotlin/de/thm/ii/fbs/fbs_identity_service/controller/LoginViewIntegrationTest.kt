package de.thm.ii.fbs.fbs_identity_service.controller

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class LoginViewIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `login endpoint is publicly accessible and returns html`() {
        mockMvc.get("/login")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
                content { string(org.hamcrest.Matchers.containsString("Feedback System")) }
                content { string(org.hamcrest.Matchers.containsString("Local Login")) }
            }
    }

    @Test
    fun `terms of use endpoint is publicly accessible and returns html`() {
        mockMvc.get("/legal/terms-of-use")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
                content { string(org.hamcrest.Matchers.containsString("Datenschutzbestimmungen")) }
            }
    }

    @Test
    fun `static css and js assets are publicly accessible`() {
        mockMvc.get("/css/material-theme.css")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith("text/css") }
                content { string(org.hamcrest.Matchers.containsString("--fbs-primary")) }
            }

        mockMvc.get("/css/login.css")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith("text/css") }
            }

        mockMvc.get("/js/login.js")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith("text/javascript") }
            }

        mockMvc.get("/images/fbs-logo.svg")
            .andExpect {
                status { isOk() }
                content { contentTypeCompatibleWith("image/svg+xml") }
            }
    }
}
