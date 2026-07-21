package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import org.springframework.stereotype.Component

@Component
class SamlRouteService {
    fun sanitize(route: String?): String? {
        val trimmedRoute = route?.trim()

        if (trimmedRoute.isNullOrEmpty()) {
            return null
        }

        if (!trimmedRoute.startsWith("/") || trimmedRoute.startsWith("//")) {
            return null
        }

        return trimmedRoute
    }
}
