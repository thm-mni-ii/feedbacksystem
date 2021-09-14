package de.thm.ii.fbs.config


import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation._

/**
  * Additional configuration for SpringBoot.
  * @author Andrej Sajenko
  */
@Configuration
class WebConfig extends WebMvcConfigurer {
  private val ALL = "*"

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
