package de.thm.ii.fbs.utils.v2.resolvers

import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.security.TokenV2Service
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.UnauthorizedException
import org.springframework.core.MethodParameter
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

class LegacyTokenResolver(
    private val tokenService: TokenV2Service
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType.equals(LegacyToken::class.java) and parameter.hasParameterAnnotation(CurrentToken::class.java)
    }

    override fun resolveArgument(parameter: MethodParameter, mavContainer: ModelAndViewContainer?, webRequest: NativeWebRequest, binderFactory: WebDataBinderFactory?): LegacyToken {
        val authentication = SecurityContextHolder.getContext().authentication
        val jwt = authentication?.principal as? Jwt
        if (jwt != null) {
            val id = jwt.subject.toIntOrNull()
                ?: (jwt.getClaim<Any>("id") as? Number)?.toInt()
                ?: (jwt.getClaim<Any>("userId") as? Number)?.toInt()
                ?: jwt.getClaim<String>("id")?.toIntOrNull()
                ?: jwt.getClaim<String>("userId")?.toIntOrNull()
                ?: throw UnauthorizedException()
            val username = jwt.getClaimAsString("username") ?: jwt.getClaimAsString("preferred_username") ?: jwt.subject
            return LegacyToken(id, username)
        }
        val token = webRequest.getHeader("Authorization")?.split(" ", limit = 2)
        if (token == null || token.size < 2) throw UnauthorizedException()
        return tokenService.verifyLegacyToken(token[1]) ?: throw UnauthorizedException()
    }
}
