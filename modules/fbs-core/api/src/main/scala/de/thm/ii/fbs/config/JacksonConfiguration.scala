package de.thm.ii.fbs.config

import tools.jackson.databind.json.JsonMapper
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
  def objectMapper(): JsonMapper = ScalaObjectMapper()
}
