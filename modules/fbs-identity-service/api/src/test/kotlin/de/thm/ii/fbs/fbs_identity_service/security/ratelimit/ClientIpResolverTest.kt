package de.thm.ii.fbs.fbs_identity_service.security.ratelimit

import org.junit.jupiter.api.assertNull
import org.springframework.mock.web.MockHttpServletRequest
import kotlin.test.Test
import kotlin.test.assertEquals

class ClientIpResolverTest {

    @Test
    fun `remoteAddr is returned when X-Forwarded-For header is missing`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 0,
            allowListString = ""
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "202.0.11.50"
        }

        val clientIp = resolver.resolve(request)

        assertEquals("202.0.11.50", clientIp)
    }

    @Test
    fun `remoteAddr is returned when trustedProxyCount is zero`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 0,
            allowListString = ""
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "202.0.11.50"
            addHeader(
                "X-Forwarded-For",
                "203.0.113.195"
            )
        }

        val clientIp = resolver.resolve(request)

        assertEquals("202.0.11.50", clientIp)
    }

    @Test
    fun `last untrusted forwarded ip is returned when trustedProxyCount is one`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 1,
            allowListString = ""
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "10.0.0.5"
            addHeader(
                "X-Forwarded-For",
                "203.0.113.195, 198.51.100.20"
            )
        }

        val clientIp = resolver.resolve(request)

        assertEquals("198.51.100.20", clientIp)
    }

    @Test
    fun `last untrusted forwarded ip is returned when trustedProxyCount is three`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 3,
            allowListString = ""
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "10.0.0.5"
            addHeader(
                "X-Forwarded-For",
                "203.0.113.195, 198.51.100.20, 10.0.0.3, 10.0.0.4"
            )
        }

        val clientIp = resolver.resolve(request)

        assertEquals("198.51.100.20", clientIp)
    }

    @Test
    fun `allowlisted proxy is skipped after trusted proxies are removed`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 2,
            allowListString = "10.0.0.2"
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "10.0.0.4"
            addHeader(
                "X-Forwarded-For",
                "203.0.113.195, 198.51.100.20, 10.0.0.2, 10.0.0.3"
            )
        }

        val clientIp = resolver.resolve(request)

        assertEquals("198.51.100.20", clientIp)
    }

    @Test
    fun `null is returned when trustedProxyCount is greater than or equal to proxy chain size`() {
        val resolver = ClientIpResolver(
            trustedProxyCount = 3,
            allowListString = ""
        )

        val request = MockHttpServletRequest()
        request.apply {
            remoteAddr = "10.0.0.4"
            addHeader(
                "X-Forwarded-For",
                "203.0.113.195, 198.51.100.20"
            )
        }

        val clientIp = resolver.resolve(request)

        assertNull(clientIp)
    }
}
