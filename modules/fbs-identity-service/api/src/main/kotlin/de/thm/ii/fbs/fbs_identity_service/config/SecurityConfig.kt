package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.saml2.provider.service.web.authentication.Saml2AuthenticationRequestResolver

@Configuration
@EnableMethodSecurity
class SecurityConfig(
    private val samlAuthSuccessHandler: SamlAuthSuccessHandler,
    private val samlAuthFailureHandler: SamlAuthFailureHandler,
    private val saml2AuthenticationRequestResolver: ObjectProvider<Saml2AuthenticationRequestResolver>,
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean
) {
    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val authoritiesConverter = JwtGrantedAuthoritiesConverter().apply {
            setAuthoritiesClaimName("globalRole")
            setAuthorityPrefix("ROLE_")
        }

        return JwtAuthenticationConverter().apply {
            setJwtGrantedAuthoritiesConverter(authoritiesConverter)
        }
    }


    @Bean
    fun securityFilterChain(http: HttpSecurity, jwtAuthenticationConverter: JwtAuthenticationConverter): SecurityFilterChain {
        var security = http
            .csrf { it.disable() }
            .authorizeHttpRequests {
                it
                    .requestMatchers(
                        "/health",
                        "/manifest",
                        "/openapi",
                        "/openapi/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/error",
                        "/graphiql",
                        "/graphiql/**"
                    ).permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/impressum").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/privacy-text").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/login/sso").permitAll()
                    .requestMatchers("/saml2/**").permitAll()
                    .requestMatchers("/login/saml2/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/graphql").authenticated()
                    .anyRequest().authenticated()
            }

        if (samlEnabled) {
            security = security
                .saml2Login {
                    it
                        .authenticationRequestResolver(saml2AuthenticationRequestResolver.getObject())
                        .successHandler(samlAuthSuccessHandler)
                        .failureHandler(samlAuthFailureHandler)
                }
                .saml2Metadata { }
        }

        return security
            .oauth2ResourceServer {
                it.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                }
            }
            .build()
    }
}
