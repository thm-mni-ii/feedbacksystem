package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings

@Configuration
class AuthServerSettingsConfig {

    @Bean
    fun authorizationServerSettings(): AuthorizationServerSettings {
        return AuthorizationServerSettings.builder()
            .issuer("http://localhost:8080")
            .build()
    }
}
