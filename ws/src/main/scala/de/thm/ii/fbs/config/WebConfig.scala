package de.thm.ii.fbs.config

import java.util

import com.fasterxml.jackson.databind.SerializationFeature
import de.thm.ii.fbs.util.ScalaObjectMapper
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
  private val ALL = "*"
  /**
    * Add the scala json mapper to http converters.
    * @return HTTP / JSON Mapper
    */
  @Bean
  def customJackson2HttpMessageConverter: MappingJackson2HttpMessageConverter = {
    val jsonConverter = new MappingJackson2HttpMessageConverter
    val objectMapper = new ScalaObjectMapper
    objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
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
      .allowedOrigins(ALL)
      .allowedMethods(ALL)
      .allowedHeaders(ALL)
      .allowCredentials(true)
      .exposedHeaders("Authorization")

    super.addCorsMappings(registry)
  }
}
