package de.thm.ii.submissioncheck.config

import java.util
import de.thm.ii.submissioncheck.misc.ScalaObjectMapper
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.servlet.config.annotation._

/**
  * Additional configuration for SpringBoot.
  * @author Andrej Sajenko
  */
@Configuration
class WebConfig extends WebMvcConfigurer {
  /**
    * Add the scala json mapper to http converters.
    * @return HTTP / JSON Mapper
    */
  @Bean
  def customJackson2HttpMessageConverter: MappingJackson2HttpMessageConverter = {
    val jsonConverter = new MappingJackson2HttpMessageConverter
    val objectMapper = new ScalaObjectMapper
    jsonConverter.setObjectMapper(objectMapper)
    jsonConverter
  }

  /**
    * Configure defaults message converts.
    * @param converters The list of converts.
    */
  override def configureMessageConverters(converters: util.List[HttpMessageConverter[_]]): Unit = {
    converters.add(customJackson2HttpMessageConverter)
  }

  /**
    * Add CORS Settings for every request.
    * @param registry CorsRegistry to modify
    */
  override def addCorsMappings(registry: CorsRegistry): Unit = {
    registry.addMapping("/**")
      .allowedMethods("PUT", "DELETE", "GET", "POST")
      .exposedHeaders("Authorization")

    super.addCorsMappings(registry)
  }
}
