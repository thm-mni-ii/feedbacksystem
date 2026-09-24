package de.thm.ii.fbs.fbs_identity_service.security.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.savedrequest.HttpSessionRequestCache
import org.springframework.security.web.savedrequest.RequestCache
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher

@Configuration
class SessionRequestCacheConfig {

    @Bean
    fun requestCache(): RequestCache {
        val requestCache = HttpSessionRequestCache()

        requestCache.setRequestMatcher(
            PathPatternRequestMatcher.withDefaults()
                .matcher("/oauth2/authorize")
        )

        return requestCache
    }
}