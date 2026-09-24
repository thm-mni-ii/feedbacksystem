package de.thm.ii.fbs.fbs_identity_service.security.ratelimit

import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Service
class LoginAttemptService(
    @param:Value("\${security.login-attempts.max-failures-per-ip:150}")
    private val maxFailuresPerIp: Int,

    @param:Value("\${security.login-attempts.max-failures-per-ip-user:15}")
    private val maxFailuresPerIpUser: Int,

    @param:Value("\${security.login-attempts.window-seconds:600}")
    private val windowSeconds: Long,

    private val clock: Clock
) {

    private data class AttemptWindow(
        val attempts: Int,
        val windowEnd: Instant
    )

    private val attemptsByIp = ConcurrentHashMap<String, AttemptWindow>()

    private val attemptsByIpUser = ConcurrentHashMap<String, AttemptWindow>()

    fun recordFailure(ip: String, username: String) {
        val normalizedUser = normalize(username)
        if (maxFailuresPerIp > 0) {
            recordAttempt(attemptsByIp, ip)
        }

        if (maxFailuresPerIpUser > 0) {
            recordAttempt(attemptsByIpUser, compositeKey(ip, normalizedUser))
        }
    }

    fun recordSuccess(username: String) {
        // Clear IP+User failure counters on successful login
        val normalizedUser = normalize(username)
        attemptsByIpUser.keys.removeIf { it.endsWith(":$normalizedUser") }
    }

    fun isBlocked(ip: String, username: String): Boolean {
        val normalizedUser = normalize(username)
        return isLimitReached(attemptsByIp, ip, maxFailuresPerIp) ||
                isLimitReached(attemptsByIpUser, compositeKey(ip, normalizedUser), maxFailuresPerIpUser)
    }

    private fun normalize(username: String): String = username.trim().lowercase()

    private fun compositeKey(ip: String, normalizedUser: String): String = "$ip:$normalizedUser"

    private fun isLimitReached(
        attempts: ConcurrentHashMap<String, AttemptWindow>,
        key: String,
        maxFailures: Int
    ): Boolean {
        if (maxFailures <= 0) {
            return false
        }

        val current = attempts[key] ?: return false
        val now = clock.instant()

        if (isExpired(current, now)) {
            attempts.remove(key, current)
            return false
        }

        return current.attempts >= maxFailures
    }

    private fun recordAttempt(attempts: ConcurrentHashMap<String, AttemptWindow>, key: String) {
        val now = clock.instant()

        attempts.compute(key) { _, current ->
            if (current == null || isExpired(current, now)) {
                AttemptWindow(
                    attempts = 1,
                    windowEnd = now.plusSeconds(windowSeconds)
                )
            } else {
                current.copy(attempts = current.attempts + 1)
            }
        }
    }

    private fun isExpired(attemptWindow: AttemptWindow, now: Instant): Boolean {
        return !now.isBefore(attemptWindow.windowEnd)
    }

    @Scheduled(fixedDelayString = "\${security.login-attempts.cleanup-interval-ms:600000}")
    fun cleanupExpiredAttempts() {
        val now = clock.instant()

        cleanupExpiredEntries(attemptsByIp, now)
        cleanupExpiredEntries(attemptsByIpUser, now)
    }

    private fun cleanupExpiredEntries(attempts: ConcurrentHashMap<String, AttemptWindow>, now: Instant) {
        attempts.forEach { (key, value) ->
            if (isExpired(value, now)) {
                attempts.remove(key, value)
            }
        }
    }
}
