package de.thm.ii.fbs.fbs_identity_service.controller

import jakarta.servlet.RequestDispatcher
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class ErrorViewIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `error page is publicly accessible and renders error template in login page design`() {
        mockMvc.get("/error") {
            accept(MediaType.TEXT_HTML)
        }.andExpect {
            content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
            content { string(containsString("Feedback System")) }
            content { string(containsString("Submit your work and get automated feedback")) }
            content { string(containsString("fbs-login-page")) }
            content { string(containsString("fbs-card-container")) }
            content { string(containsString("fbs-error-card")) }
            content { string(containsString("Invalid Request")) }
            content { string(containsString("This is an error in the application that redirected you here")) }
            content { string(containsString("contact the administrator of that application")) }
            content { string(containsString("Back to Login")) }
            content { string(containsString("Terms of Use")) }
            content { string(containsString("Imprint")) }
            content { string(containsString("/css/material-theme.css")) }
            content { string(containsString("/css/login.css")) }
            content { string(containsString("/js/login.js")) }
            content { string(containsString("fbs-github-link")) }
        }
    }

    @Test
    fun `error page with 400 bad request attributes displays technical details and invalid request guidance`() {
        mockMvc.get("/error") {
            accept(MediaType.TEXT_HTML)
            requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 400)
            requestAttr(RequestDispatcher.ERROR_MESSAGE, "[invalid_request] OAuth 2.0 Parameter: client_id")
            requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/oauth2/authorize")
        }.andExpect {
            status { isBadRequest() }
            content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
            content { string(containsString("Invalid Request")) }
            content { string(containsString("This is an error in the application that redirected you here")) }
            content { string(containsString("contact the administrator of that application")) }
            content { string(containsString("Technical Details")) }
            content { string(containsString("400")) }
            content { string(containsString("/oauth2/authorize")) }
            content { string(containsString("[invalid_request] OAuth 2.0 Parameter: client_id")) }
            content { string(containsString("Back to Login")) }
        }
    }

    @Test
    fun `error page with 404 status displays not found message`() {
        mockMvc.get("/error") {
            accept(MediaType.TEXT_HTML)
            requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404)
            requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/unknown-endpoint")
        }.andExpect {
            status { isNotFound() }
            content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
            content { string(containsString("Page Not Found")) }
            content { string(containsString("The page or endpoint you requested does not exist")) }
            content { string(containsString("404")) }
            content { string(containsString("/unknown-endpoint")) }
        }
    }

    @Test
    fun `error page with json accept header returns json for api clients`() {
        mockMvc.get("/error") {
            accept(MediaType.APPLICATION_JSON)
            requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 400)
            requestAttr(RequestDispatcher.ERROR_MESSAGE, "Bad Request")
            requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/api/v1/resource")
        }.andExpect {
            status { isBadRequest() }
            content { contentTypeCompatibleWith(MediaType.APPLICATION_JSON) }
            jsonPath("$.status") { value(400) }
            jsonPath("$.path") { value("/api/v1/resource") }
        }
    }

    @Test
    fun `invalid oauth2 authorization request without required parameters returns 400`() {
        mockMvc.get("/oauth2/authorize") {
            queryParam("client_id", "invalid-client-id")
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `oauth2 authorize with unregistered redirect_uri returns 400`() {
        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "https://unregistered-evil-site.com/callback")
            queryParam("scope", "openid profile")
            queryParam("code_challenge", "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q")
            queryParam("code_challenge_method", "S256")
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `oauth2 authorize with unknown client_id returns 400`() {
        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "code")
            queryParam("client_id", "completely-unknown-client-id")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid")
            queryParam("code_challenge", "ZKvd7XvDllsX65fhzUdFzFvYti9384GOnbbmpWOpF-Q")
            queryParam("code_challenge_method", "S256")
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `oauth2 authorize with invalid response_type returns 400`() {
        mockMvc.get("/oauth2/authorize") {
            queryParam("response_type", "token")
            queryParam("client_id", "fbs-test-client")
            queryParam("redirect_uri", "http://127.0.0.1:4200/oauth2/callback")
            queryParam("scope", "openid")
        }.andExpect {
            status { isBadRequest() }
        }
    }
}
