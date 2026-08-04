package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Component

@Component
class SamlSessionCleanupService {

    private val log = LoggerFactory.getLogger(SamlSessionCleanupService::class.java)

    fun clearSession(
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        val existingSession = request.getSession(false)

        if (existingSession != null) {
            log.debug("Invalidating existing SAML session after login handling")
            existingSession.invalidate()
        }

        val sessionCookie = ResponseCookie.from("JSESSIONID", "")
            .path("/")
            .httpOnly(true)
            .secure(request.isSecure)
            .maxAge(0)
            .build()

        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie.toString())
    }
}