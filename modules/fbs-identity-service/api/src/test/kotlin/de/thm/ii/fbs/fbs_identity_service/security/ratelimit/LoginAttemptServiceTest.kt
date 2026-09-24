package de.thm.ii.fbs.fbs_identity_service.security.ratelimit

import org.junit.jupiter.api.BeforeEach
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class LoginAttemptServiceTest {

    private class MutableClock(
        private var currentInstant: Instant,
        private val currentZone: ZoneId = ZoneOffset.UTC
    ) : Clock() {

        override fun instant(): Instant = currentInstant

        override fun getZone(): ZoneId = currentZone

        override fun withZone(zone: ZoneId): Clock =
            MutableClock(currentInstant, zone)

        fun advance(duration: Duration) {
            currentInstant = currentInstant.plus(duration)
        }
    }

    private lateinit var clock: MutableClock
    private lateinit var service: LoginAttemptService

    @BeforeEach
    fun setUp() {
        clock = MutableClock(
            Instant.parse("2026-07-31T12:00:00Z")
        )

        service = LoginAttemptService(
            maxFailuresPerIp = 150,
            maxFailuresPerIpUser = 15,
            windowSeconds = 600,
            clock = clock
        )
    }

    @Test
    fun `unknown ip and username are not blocked`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        val isBlocked = service.isBlocked(clientIp, username)

        assertFalse(isBlocked)
    }

    @Test
    fun `ip is blocked when configured failure limit is reached`() {
        val clientIp = "202.0.11.50"

        repeat(150) { index ->
            val username = "user$index"

            assertFalse(service.isBlocked(clientIp, username))
            service.recordFailure(clientIp, username)
        }

        val isBlocked = service.isBlocked(
            clientIp,
            "another-user"
        )

        assertTrue(isBlocked)
    }

    @Test
    fun `ip and user compound key is blocked when configured failure limit is reached`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        repeat(15) {
            assertFalse(service.isBlocked(clientIp, username))
            service.recordFailure(clientIp, username)
        }

        val isBlockedOnSameIp = service.isBlocked(
            clientIp,
            username
        )
        assertTrue(isBlockedOnSameIp)

        // Denial of Service protection: a different IP is NOT blocked
        val isBlockedOnDifferentIp = service.isBlocked(
            "202.0.11.51",
            username
        )
        assertFalse(isBlockedOnDifferentIp)
    }

    @Test
    fun `username normalization treats different casing and whitespace as identical`() {
        val clientIp = "202.0.11.50"

        repeat(5) {
            service.recordFailure(clientIp, "Paul")
            service.recordFailure(clientIp, "paul")
            service.recordFailure(clientIp, "  PAUL  ")
        }

        assertTrue(service.isBlocked(clientIp, "pAuL"))
        assertTrue(service.isBlocked(clientIp, "  paul"))
    }

    @Test
    fun `successful login resets the compound counter for user across ips`() {
        val clientIp1 = "202.0.11.50"
        val clientIp2 = "202.0.11.51"
        val username = "Paul"

        repeat(14) {
            service.recordFailure(clientIp1, username)
            service.recordFailure(clientIp2, username)
        }

        service.recordSuccess("PAUL")

        repeat(14) {
            assertFalse(service.isBlocked(clientIp1, username))
            service.recordFailure(clientIp1, username)
        }

        assertFalse(service.isBlocked(clientIp1, username))

        service.recordFailure(clientIp1, username)

        assertTrue(service.isBlocked(clientIp1, username))
    }

    @Test
    fun `recordSuccess does not modify ip counters`() {
        val clientIp = "202.0.11.50"
        val anotherUsername = "another-user"

        repeat(149) { index ->
            service.recordFailure(
                clientIp,
                "user$index"
            )
        }

        service.recordSuccess(anotherUsername)

        assertFalse(
            service.isBlocked(
                clientIp,
                anotherUsername
            )
        )

        service.recordFailure(
            clientIp,
            anotherUsername
        )

        assertTrue(
            service.isBlocked(
                clientIp,
                anotherUsername
            )
        )
    }

    @Test
    fun `ip and user is no longer blocked after window expires`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        repeat(15) {
            service.recordFailure(
                clientIp,
                username
            )
        }

        assertTrue(
            service.isBlocked(
                clientIp,
                username
            )
        )

        clock.advance(Duration.ofMinutes(10).minusSeconds(1))

        assertTrue(
            service.isBlocked(
                clientIp,
                username
            )
        )

        clock.advance(Duration.ofSeconds(1))

        assertFalse(
            service.isBlocked(
                clientIp,
                username
            )
        )
    }

    @Test
    fun `ip is no longer blocked after window expires`() {
        val clientIp = "202.0.11.50"

        repeat(150) { index ->
            service.recordFailure(
                clientIp,
                "user$index"
            )
        }

        assertTrue(
            service.isBlocked(
                clientIp,
                "another-user"
            )
        )

        clock.advance(Duration.ofMinutes(10).minusSeconds(1))

        assertTrue(
            service.isBlocked(
                clientIp,
                "another-user"
            )
        )

        clock.advance(Duration.ofSeconds(1))

        assertFalse(
            service.isBlocked(
                clientIp,
                "another-user"
            )
        )
    }

    @Test
    fun `ip-user limit is disabled when configured limit is zero`() {
        val service = LoginAttemptService(
            maxFailuresPerIp = 150,
            maxFailuresPerIpUser = 0,
            windowSeconds = 600,
            clock = clock
        )

        val clientIp = "202.0.11.50"

        repeat(20) {
            service.recordFailure(
                clientIp,
                "Paul"
            )
        }

        assertFalse(
            service.isBlocked(
                clientIp,
                "Paul"
            )
        )
    }

    @Test
    fun `ip limit is disabled when configured limit is zero`() {
        val service = LoginAttemptService(
            maxFailuresPerIp = 0,
            maxFailuresPerIpUser = 15,
            windowSeconds = 600,
            clock = clock
        )

        val clientIp = "202.0.11.50"

        repeat(250) { index ->
            service.recordFailure(
                clientIp,
                "user$index"
            )
        }

        assertFalse(
            service.isBlocked(
                clientIp,
                "another-user"
            )
        )
    }

    @Test
    fun `cleanupExpiredAttempts removes expired entries`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        service.recordFailure(clientIp, username)
        clock.advance(Duration.ofMinutes(11))

        service.cleanupExpiredAttempts()

        // Should not be blocked even after recording 14 more attempts (total would be 15 if not cleaned)
        repeat(14) {
            service.recordFailure(clientIp, username)
        }
        assertFalse(service.isBlocked(clientIp, username))
    }
}
