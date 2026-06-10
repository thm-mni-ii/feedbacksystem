package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .authorizeHttpRequests {
                it
                    .requestMatchers("/health", "/manifest", "/graphql", "/graphiql", "/api/v1/auth/login", "/error").permitAll()
                    .anyRequest().authenticated()
            }
            .build()
    }
}