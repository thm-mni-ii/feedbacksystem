package de.thm.ii.fbs.security.v2

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.*
import java.util.concurrent.locks.ReentrantLock
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.collections.HashMap

@Component
class AntiBruteForceInterceptor(
    @Value("\${security.antiBruteForce.trustedProxyCount}")
    private val trustedProxyCount: Int = 0,
    @Value("\${security.antiBruteForce.interval}")
    private val interval: Int = 60 * 10,
    @Value("\${security.antiBruteForce.maxAttempts}")
    private val maxAttempts: Int = 10,
    @Value("\${security.antiBruteForce.protectedPaths}")
    private val protectedPathsString: String = "/api/v1/login/ldap,/api/v1/login/local,/api/v1/login/unified",
    @Value("\${security.antiBruteForce.allowList}")
    private val allowListString: String = ""
) : HandlerInterceptor {
    private data class LoginAttempts(val attempts: Int = 0, val lastAttempt: Date? = null)

    private val logger = LoggerFactory.getLogger(AntiBruteForceInterceptor::class.java)
    private val logins = HashMap<String, LoginAttempts>() // Can be a non-concurrent map because it is guarded by lock
    private val lock = ReentrantLock(true)
    private var lastClean = Date()

    private val protectedPaths
        get() = protectedPathsString.split(",")
    private val allowList
        get() = allowListString.split(",")

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        super.preHandle(request, response, handler)
        cleanIfNeeded()

        if (!protectedPaths.contains(request.servletPath)) {
            return true
        }

        val forwardForHeader = request.getHeader("X-FORWARDED-FOR") ?: ""
        val proxies = forwardForHeader.split(", ") + request.remoteAddr

        val ip = getRealIp(proxies)
        if (ip == null) {
            logger.warn("Blocked request: Failed to determine ip")
            response.sendError(400, "Failed to determine client ip")
            return false
        }

        val result = check(ip)
        if (!result) {
            logger.warn("Blocked request from $ip: Too Many Requests")
            response.sendError(429, "Too Many Requests")
        }
        return result
    }

    internal fun getRealIp(proxies: List<String>): String? {
        val filteredProxies = proxies
            .slice(0 until proxies.size - trustedProxyCount)
            .filter { !allowList.contains(it) }
        val ip = filteredProxies.lastOrNull()
        if (ip.isNullOrBlank()) return null

        return ip
    }

    private fun check(ip: String): Boolean {
        lock.lock()
        var lastLoginAttempt = logins[ip] ?: LoginAttempts()
        if (lastLoginAttempt.lastAttempt !== null && (Date().time - lastLoginAttempt.lastAttempt!!.time) / 1000 > interval) {
            lastLoginAttempt = LoginAttempts()
        }

        if (lastLoginAttempt.attempts >= maxAttempts) {
            lock.unlock()
            return false
        }

        val currentLoginAttempt = LoginAttempts(lastLoginAttempt.attempts + 1, Date())
        logins[ip] = currentLoginAttempt
        lock.unlock()

        return true
    }

    private fun cleanIfNeeded() {
        lock.lock()
        if (Date().time - lastClean.time / 1000 > interval) {
            for ((ip, lastLoginAttempt) in logins) {
                if (lastLoginAttempt.lastAttempt !== null && (Date().time - lastLoginAttempt.lastAttempt.time) / 1000 > interval) {
                    logins.remove(ip)
                }
            }
            lastClean = Date()
        }
        lock.unlock()
    }
}
