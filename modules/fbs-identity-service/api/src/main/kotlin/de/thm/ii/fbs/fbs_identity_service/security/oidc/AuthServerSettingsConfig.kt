package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings

@Configuration
class AuthServerSettingsConfig {

    @Bean
    fun authorizationServerSettings(
        @Value("\${security.oidc.issuer:}")
        configuredIssuer: String
    ): AuthorizationServerSettings {
        val builder = AuthorizationServerSettings.builder()
        val cleanIssuer = configuredIssuer.trim().removeSuffix("/")
        if (cleanIssuer.isNotBlank()) {
            builder.issuer(cleanIssuer)
        }
        return builder.build()
    }
}
