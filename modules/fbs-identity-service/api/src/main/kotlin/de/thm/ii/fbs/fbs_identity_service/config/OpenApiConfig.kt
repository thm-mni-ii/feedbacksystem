package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info

@Configuration
class OpenApiConfig {

    @Bean
    fun identityServiceOpenApi(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("FBS Identity Service API")
                    .version("0.0.1-SNAPSHOT")
                    .description("REST API documentation for the FBS Identity-Service.")
            )
    }
}
