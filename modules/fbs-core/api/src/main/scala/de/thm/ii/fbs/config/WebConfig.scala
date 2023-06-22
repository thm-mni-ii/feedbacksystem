package de.thm.ii.fbs.config

import de.thm.ii.fbs.security.v2.AntiBruteForceInterceptor
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation._

/**
  * Additional configuration for SpringBoot.
  * @author Andrej Sajenko
  */
@Configuration
class WebConfig extends WebMvcConfigurer {
  private val ALL = "*"
  @Autowired
  private val antiBruteForceInterceptor: AntiBruteForceInterceptor = null

  /**
    * Add CORS Settings for every request.
    * @param registry CorsRegistry to modify
    */
  override def addCorsMappings(registry: CorsRegistry): Unit = {
    registry.addMapping("/**")
      .allowedOriginPatterns(ALL)
      .allowedMethods(ALL)
      .allowedHeaders(ALL)
      .allowCredentials(true)
      .exposedHeaders("Authorization")

    super.addCorsMappings(registry)
  }

  override def addInterceptors(registry: InterceptorRegistry): Unit = {
    super.addInterceptors(registry)
    registry.addInterceptor(antiBruteForceInterceptor)
  }
}
