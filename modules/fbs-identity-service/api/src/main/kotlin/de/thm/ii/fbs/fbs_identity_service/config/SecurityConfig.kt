package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig(
    private val samlAuthSuccessHandler: SamlAuthSuccessHandler,
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        var security = http
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
                    .requestMatchers(HttpMethod.GET, "/api/v1/login/sso").permitAll()
                    .requestMatchers("/api/v1/login/saml/**").permitAll()
                    .requestMatchers("/saml2/**").permitAll()
                    .anyRequest().authenticated()
            }

        if (samlEnabled) {
            security = security
                .saml2Login {
                    it
                        //.loginProcessingUrl("/api/v1/login/saml/acs")
                        .successHandler(samlAuthSuccessHandler)
                }
                .saml2Metadata {
                    //it.metadataUrl("/api/v1/login/saml/metadata")
                }
        }

        return security
            .oauth2ResourceServer {
                it.jwt {}
            }
            .build()
    }
}