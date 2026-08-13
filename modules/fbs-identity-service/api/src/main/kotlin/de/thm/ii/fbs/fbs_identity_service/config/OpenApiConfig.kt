package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.info.BuildProperties

@Configuration
class OpenApiConfig(
    @param:Value("\${info.app.version:0.0.1-SNAPSHOT}")
    private val fallbackVersion: String,

    buildPropertiesProvider: ObjectProvider<BuildProperties>
) {

    private val buildProperties = buildPropertiesProvider.ifAvailable

    @Bean
    fun identityServiceOpenApi(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("FBS Identity Service API")
                    .version(buildProperties?.version ?: fallbackVersion)
                    .description("REST API documentation for the FBS Identity-Service.")
            )
    }
}
