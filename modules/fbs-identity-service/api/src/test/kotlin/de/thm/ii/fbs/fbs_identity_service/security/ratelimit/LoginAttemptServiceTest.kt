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
            maxFailuresPerUsername = 10,
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
    fun `username is blocked when configured failure limit is reached`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        repeat(10) {
            assertFalse(service.isBlocked(clientIp, username))
            service.recordFailure(clientIp, username)
        }

        val isBlocked = service.isBlocked(
            "202.0.11.51",
            username
        )

        assertTrue(isBlocked)
    }

    @Test
    fun `successful login resets the username counter`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        repeat(9) {
            service.recordFailure(clientIp, username)
        }

        service.recordSuccess(username)

        repeat(9) {
            assertFalse(service.isBlocked(clientIp, username))
            service.recordFailure(clientIp, username)
        }

        assertFalse(service.isBlocked(clientIp, username))

        service.recordFailure(clientIp, username)

        assertTrue(service.isBlocked(clientIp, username))
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
    fun `username is no longer blocked after window expires`() {
        val clientIp = "202.0.11.50"
        val username = "Paul"

        repeat(10) {
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
    fun `username limit is disabled when configured limit is zero`() {
        val service = LoginAttemptService(
            maxFailuresPerIp = 150,
            maxFailuresPerUsername = 0,
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
            maxFailuresPerUsername = 10,
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
}
