package de.thm.ii.fbs.fbs_identity_service.config

import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.slf4j.LoggerFactory

@Configuration
class SecurityConfig(
    private val samlAuthSuccessHandler: SamlAuthSuccessHandler,
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean
) {

    private val log = LoggerFactory.getLogger(SecurityConfig::class.java)

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
                    .requestMatchers("/saml2/**").permitAll()
                    .requestMatchers("/login/saml2/**").permitAll()
                    .anyRequest().authenticated()
            }

        if (samlEnabled) {
            security = security
                .saml2Login {
                    it
                        .successHandler(samlAuthSuccessHandler)
                        .failureHandler { request, response, exception ->
                            log.warn(
                                "SAML login failed for request URI {}: {}",
                                request.requestURI,
                                exception.message,
                                exception
                            )

                            response.status = HttpServletResponse.SC_UNAUTHORIZED
                            response.contentType = "application/json"
                            response.writer.write(
                                """
                                {
                                  "error": "SAML_LOGIN_FAILED",
                                  "message": "SAML login failed"
                                }
                                """.trimIndent()
                            )
                        }
                }
                .saml2Metadata { }
        }

        return security
            .oauth2ResourceServer {
                it.jwt {}
            }
            .build()
    }
}