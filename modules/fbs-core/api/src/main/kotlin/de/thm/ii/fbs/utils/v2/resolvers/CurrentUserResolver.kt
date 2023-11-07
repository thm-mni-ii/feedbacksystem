package de.thm.ii.fbs.utils.v2.resolvers

import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.model.v2.security.User
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.annotations.CurrentUser
import de.thm.ii.fbs.utils.v2.exceptions.UnauthorizedException
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import kotlin.jvm.optionals.getOrDefault
import kotlin.jvm.optionals.getOrNull

class CurrentUserResolver(
        private val tokenResolver: LegacyTokenResolver,
        private val userRepository: UserRepository,
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType.equals(User::class.java) and parameter.hasParameterAnnotation(CurrentUser::class.java)
    }

    override fun resolveArgument(parameter: MethodParameter, mavContainer: ModelAndViewContainer?, webRequest: NativeWebRequest, binderFactory: WebDataBinderFactory?): User {
        val token = tokenResolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory)
        return userRepository.findById(token.id).orElse(null) ?: throw UnauthorizedException()
    }
}
