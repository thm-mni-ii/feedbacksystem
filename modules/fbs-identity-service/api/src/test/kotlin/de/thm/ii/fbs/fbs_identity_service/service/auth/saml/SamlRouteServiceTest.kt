package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class SamlRouteServiceTest {

    private val service = SamlRouteService()

    @Test
    fun `sanitize returns null when route parameter is blank`() {
        val result = service.sanitize("   ")

        assertNull(result)
    }

    @Test
    fun `sanitize returns null when route parameter is null`() {
        val result = service.sanitize(null)

        assertNull(result)
    }

    @Test
    fun `sanitize returns null when route parameter is protocol-relative URL`() {
        val result = service.sanitize("//evil.com")

        assertNull(result)
    }

    @Test
    fun `sanitize returns null when route parameter does not start with leading slash`() {
        val result = service.sanitize("courses/123")

        assertNull(result)
    }

    @Test
    fun `sanitize returns trimmed route when route parameter is valid`() {
        val result = service.sanitize("/courses/123")

        assertEquals("/courses/123", result)
    }

    @Test
    fun `sanitize returns valid internal route`() {
        val result = service.sanitize("/groups")

        assertEquals("/groups", result)
    }
}