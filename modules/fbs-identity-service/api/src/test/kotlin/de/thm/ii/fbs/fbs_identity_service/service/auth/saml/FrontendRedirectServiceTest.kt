package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import de.thm.ii.fbs.fbs_identity_service.exception.InvalidFrontendRedirectPathException
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals

class FrontendRedirectServiceTest {

    private val service = FrontendRedirectService("https://localhost")

    @Test
    fun `buildRedirectUrl combines frontend base url and internal path`() {
        val result = service.buildRedirectUrl("/login")

        assertEquals("https://localhost/login", result)
    }

    @Test
    fun `buildRedirectUrl supports internal path with query`() {
        val result = service.buildRedirectUrl("/login?ssoError=1")

        assertEquals("https://localhost/login?ssoError=1", result)
    }

    @Test
    fun `buildRedirectUrl rejects path without leading slash`() {
        val exception = assertThrows(InvalidFrontendRedirectPathException::class.java) {
            service.buildRedirectUrl("login")
        }

        assertEquals("Invalid frontend redirect path: login", exception.message)
    }

    @Test
    fun `buildRedirectUrl rejects protocol relative path`() {
        val exception = assertThrows(InvalidFrontendRedirectPathException::class.java) {
            service.buildRedirectUrl("//evil.example")
        }

        assertEquals("Invalid frontend redirect path: //evil.example", exception.message)
    }

    @Test
    fun `buildRedirectUrl removes trailing slash from frontend base url`() {
        val service = FrontendRedirectService("https://localhost/")

        val result = service.buildRedirectUrl("/login")

        assertEquals("https://localhost/login", result)
    }

    @Test
    fun `buildRedirectUrl adds route query parameter`() {
        val result = service.buildRedirectUrl("/login", "/courses/123")

        assertEquals("https://localhost/login?route=/courses/123", result)
    }
}
