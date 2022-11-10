package de.thm.ii.fbs.controller.v2.resolvers

import de.thm.ii.fbs.common.types.checkerApi.Token
import de.thm.ii.fbs.controller.v2.exceptions.BadRequestException
import de.thm.ii.fbs.services.v2.security.CheckerSecurityService
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

class TokenResolver(
    private val checkerSecurityService: CheckerSecurityService
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType.equals(Token::class.java) and parameter.hasParameterAnnotation(TokenFromAuthorization::class.java)
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any? {
        val auth = webRequest.getHeader("Authorization") ?: throw BadRequestException("no authorization header provided")
        val split = auth.split(" ", limit = 2)
        if (split.size != 2) throw BadRequestException("invalid authorization header")
        return checkerSecurityService.validateAuthorization(split[1])
    }
}
