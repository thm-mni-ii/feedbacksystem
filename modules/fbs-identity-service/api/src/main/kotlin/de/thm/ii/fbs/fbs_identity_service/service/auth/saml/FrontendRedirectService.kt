package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import de.thm.ii.fbs.fbs_identity_service.exception.InvalidFrontendRedirectPathException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Component
class FrontendRedirectService(
    @param:Value("\${app.frontend.base-url:https://localhost}")
    private val frontendBaseUrl: String
) {

    fun buildRedirectUrl(path: String, route: String? = null): String {
        val safePath = requireInternalPath(path)

        val builder = UriComponentsBuilder
            .fromUriString(frontendBaseUrl.trimEnd('/') + safePath)

        route?.let {
            builder.queryParam("route", it)
        }

        return builder
            .build()
            .encode()
            .toUriString()
    }

    private fun requireInternalPath(path: String): String {
        val trimmedPath = path.trim()

        if (!trimmedPath.startsWith("/") || trimmedPath.startsWith("//")) {
            throw InvalidFrontendRedirectPathException(
                trimmedPath
            )
        }

        return trimmedPath
    }
}
