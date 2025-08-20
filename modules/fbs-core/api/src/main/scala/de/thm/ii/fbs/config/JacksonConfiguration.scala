package de.thm.ii.fbs.config

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.springframework.context.annotation.{Bean, Configuration, Primary}

/**
  * Jackson configuration
  */
@Configuration
class JacksonConfiguration {
  /**
    * @return Default System object mapper
    */
  @Bean
  @Primary
  def objectMapper(): ObjectMapper = new ScalaObjectMapper
}
