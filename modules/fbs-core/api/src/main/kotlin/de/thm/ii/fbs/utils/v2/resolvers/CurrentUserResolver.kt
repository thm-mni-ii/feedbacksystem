package de.thm.ii.fbs.utils.v2.resolvers

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.services.v2.security.TokenService
import de.thm.ii.fbs.utils.v2.annotations.CurrentUser
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

class CurrentUserResolver(
        private val tokenService: TokenService,
        private val userRepository: UserRepository,
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType.equals(User::class.java) and parameter.hasParameterAnnotation(CurrentUser::class.java)
    }

    override fun resolveArgument(parameter: MethodParameter, mavContainer: ModelAndViewContainer?, webRequest: NativeWebRequest, binderFactory: WebDataBinderFactory?): Any? {
        val token = webRequest.getHeader("Authorization")!!.split(" ", limit = 2)
        return userRepository.findByUsername(tokenService.verify(token[1])!!)
    }
}
