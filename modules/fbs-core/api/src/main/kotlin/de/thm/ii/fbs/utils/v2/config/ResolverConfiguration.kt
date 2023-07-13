package de.thm.ii.fbs.utils.v2.config

import de.thm.ii.fbs.services.v2.security.TokenV2Service
import de.thm.ii.fbs.utils.v2.resolvers.LegacyTokenResolver
import org.springframework.stereotype.Component
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class ResolverConfiguration(
    private val tokenService: TokenV2Service
) : WebMvcConfigurer {
    override fun addArgumentResolvers(
        resolvers: MutableList<HandlerMethodArgumentResolver?>
    ) {
        resolvers.add(LegacyTokenResolver(tokenService))
    }
}
