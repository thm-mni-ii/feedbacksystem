package de.thm.ii.fbs.utils.v2.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class PlaygroundJacksonConfiguration {

    @Bean(name = ["playgroundObjectMapper"])
    open fun playgroundObjectMapper(): ObjectMapper {
        return ObjectMapper()
            .registerKotlinModule()
            .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
            .configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true)
    }
}
