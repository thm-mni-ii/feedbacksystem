package de.thm.ii.fbs.utils.v2.resolvers

import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.services.v2.security.TokenV2Service
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.UnauthorizedException
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

class LegacyTokenResolver(
        private val tokenService: TokenV2Service,
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType.equals(LegacyToken::class.java) and parameter.hasParameterAnnotation(CurrentToken::class.java)
    }

    override fun resolveArgument(parameter: MethodParameter, mavContainer: ModelAndViewContainer?, webRequest: NativeWebRequest, binderFactory: WebDataBinderFactory?): LegacyToken {
        val token = webRequest.getHeader("Authorization")?.split(" ", limit = 2)
        if (token == null || token.size < 2) throw UnauthorizedException()
        return tokenService.verifyLegacyToken(token[1]) ?: throw UnauthorizedException()
    }
}
