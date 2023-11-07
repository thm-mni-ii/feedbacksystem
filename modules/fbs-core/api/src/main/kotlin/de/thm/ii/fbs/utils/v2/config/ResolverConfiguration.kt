package de.thm.ii.fbs.utils.v2.config

import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.services.v2.security.TokenV2Service
import de.thm.ii.fbs.utils.v2.resolvers.CurrentUserResolver
import de.thm.ii.fbs.utils.v2.resolvers.LegacyTokenResolver
import org.springframework.stereotype.Component
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class ResolverConfiguration(
    private val tokenService: TokenV2Service,
    private val userRepository: UserRepository,
) : WebMvcConfigurer {
    override fun addArgumentResolvers(
        resolvers: MutableList<HandlerMethodArgumentResolver?>
    ) {
        val tokenResolver = LegacyTokenResolver(tokenService)
        resolvers.add(tokenResolver)
        resolvers.add(CurrentUserResolver(tokenResolver, userRepository))
    }
}
