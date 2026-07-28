package de.thm.ii.fbs.fbs_identity_service.security.ratelimit

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class ClientIpResolver(
    @param:Value("\${security.login-attempts.trusted-proxy-count:0}")
    private val trustedProxyCount: Int,

    @param:Value("\${security.login-attempts.allow-list:}")
    private val allowListString: String
) {
    private val allowList = allowListString
        .split(",")
        .map { it.trim() }
        .filter { it.isNotEmpty() }

    fun resolve(request: HttpServletRequest): String? {

        val forwardedFor = request
            .getHeader("X-Forwarded-For")
            ?.split(",")
            ?.map { it.trim() }
            ?.filter { it.isNotEmpty() }
            ?: emptyList()

        val proxies = forwardedFor + request.remoteAddr

        if (trustedProxyCount < 0 || trustedProxyCount >= proxies.size) {
            return null
        }

        val candidates = proxies
            .dropLast(trustedProxyCount)
            .filter { it !in allowList }

        return candidates.lastOrNull()?.takeIf { it.isNotBlank() }
    }
}
