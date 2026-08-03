package de.thm.ii.fbs.fbs_identity_service.security.oidc

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository

@Configuration
class AuthServerClientConfig {

    @Bean
    fun registeredClientRepository(
        jdbcTemplate: JdbcTemplate
    ): RegisteredClientRepository =
        JdbcRegisteredClientRepository(jdbcTemplate)
}
