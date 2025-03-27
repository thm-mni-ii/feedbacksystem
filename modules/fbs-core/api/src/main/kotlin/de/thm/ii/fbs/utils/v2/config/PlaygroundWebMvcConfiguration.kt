package de.thm.ii.fbs.utils.v2.config

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
open class PlaygroundWebMvcConfiguration(
    @Qualifier("playgroundObjectMapper")
    private val playgroundMapper: ObjectMapper
) : WebMvcConfigurer {

    override fun extendMessageConverters(converters: MutableList<HttpMessageConverter<*>>) {
        converters
            .filterIsInstance<MappingJackson2HttpMessageConverter>()
            .forEach { it.objectMapper = playgroundMapper }
    }
}