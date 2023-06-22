package de.thm.ii.fbs.security.v2

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantLock
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class AntiBruteForceInterceptor(
    @Value("\${security.antiBruteForce.trustedProxyCount}")
    private val trustedProxyCount: Int = 0,
    @Value("\${security.antiBruteForce.interval}")
    private val interval: Int = 60 * 10,
    @Value("\${security.antiBruteForce.maxAttempts}")
    private val maxAttempts: Int = 10,
    @Value("\${security.antiBruteForce.protectedPaths}")
    private val protectedPathsString: String = "/api/v1/login/ldap,/api/v1/login/local,/api/v1/login/unified"
) : HandlerInterceptor {
    private data class LoginAttempts(val attempts: Int = 0, val lastAttempt: Date? = null)

    private val logins = ConcurrentHashMap<String, LoginAttempts>()
    private val lock = ReentrantLock(true)
    private var lastClean = Date()

    private val protectedPaths
        get() = protectedPathsString.split(",")

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        super.preHandle(request, response, handler)
        cleanIfNeeded()

        if (!protectedPaths.contains(request.servletPath)) {
            return true
        }

        val forwardForHeader = request.getHeader("X-FORWARDED-FOR") ?: ""
        val proxies = forwardForHeader.split(", ") + request.remoteAddr
        val filteredProxies = proxies.slice(0 until proxies.size - trustedProxyCount)
        val ip = filteredProxies.last()

        lock.lock()
        var lastLoginAttempt = logins[ip] ?: LoginAttempts()
        if (lastLoginAttempt.lastAttempt !== null && (Date().time - lastLoginAttempt.lastAttempt!!.time) / 1000 > interval) {
            lastLoginAttempt = LoginAttempts()
        }

        if (lastLoginAttempt.attempts >= maxAttempts) {
            response.sendError(429, "Too Many Requests")
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
