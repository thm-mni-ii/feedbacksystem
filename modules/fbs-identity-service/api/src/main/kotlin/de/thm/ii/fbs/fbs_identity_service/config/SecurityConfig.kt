package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
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
                    .requestMatchers(
                        "/health",
                        "/manifest",
                        "/graphiql",
                        "/error"
                    ).permitAll()
                    .requestMatchers(HttpMethod.POST, "/graphql").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/impressum").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/privacy-text").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer {
                it.jwt {}
            }
            .build()
    }
}