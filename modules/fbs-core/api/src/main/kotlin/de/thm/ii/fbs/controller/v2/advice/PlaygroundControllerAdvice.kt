package de.thm.ii.fbs.controller.v2.advice

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.core.MethodParameter
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice

@ControllerAdvice(basePackages = ["de.thm.ii.fbs.controller.v2.PlaygroundController"])
open class PlaygroundControllerAdvice(
    @Qualifier("playgroundObjectMapper")
    private val playgroundMapper: ObjectMapper
) : ResponseBodyAdvice<Any> {

    private lateinit var converters: List<HttpMessageConverter<*>>

    override fun supports(
        returnType: MethodParameter,
        converterType: Class<out HttpMessageConverter<*>>
    ): Boolean {
        return true
    }

    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse
    ): Any? {
        converters
            .filterIsInstance<MappingJackson2HttpMessageConverter>()
            .forEach { it.objectMapper = playgroundMapper }

        return body
    }
}
