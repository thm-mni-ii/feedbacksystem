package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings

@Configuration
class AuthServerSettingsConfig(
    @param:Value("\${security.oidc.issuer}")
    private val issuer: String
) {

    @Bean
    fun authorizationServerSettings(): AuthorizationServerSettings {
        return AuthorizationServerSettings.builder()
            .issuer(issuer)
            .build()
    }
}