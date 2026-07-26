package de.thm.ii.fbs.fbs_identity_service.config

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.oauth2.core.oidc.OidcScopes
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint
import org.springframework.security.web.savedrequest.RequestCache
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher

@Configuration
@EnableMethodSecurity
class SecurityConfig(
    private val samlAuthSuccessHandler: SamlAuthSuccessHandler,
    private val samlAuthFailureHandler: SamlAuthFailureHandler,
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean
) {

    @Bean
    @Order(1)
    fun authServerSecurityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {
        val authorizationServerConfigurer =
            OAuth2AuthorizationServerConfigurer.authorizationServer()

        http
            .securityMatcher(authorizationServerConfigurer.endpointsMatcher)
            .with(authorizationServerConfigurer) { authorizationServer ->
                authorizationServer
                    .oidc { oidc ->
                        oidc.providerConfigurationEndpoint { providerConfiguration ->
                            providerConfiguration.providerConfigurationCustomizer { metadata ->
                                metadata.scope(OidcScopes.PROFILE)
                            }
                        }
                    }
            }
            .authorizeHttpRequests {
                it.anyRequest().authenticated()
            }
            .exceptionHandling {
                it.defaultAuthenticationEntryPointFor(
                    LoginUrlAuthenticationEntryPoint("/login"),
                    MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                )
            }

        return http.build()
    }

    @Bean
    @Order(2)
    fun applicationSecurityFilterChain(
        http: HttpSecurity,
        @Qualifier("authorizationServerJwtDecoder")
        authorizationServerJwtDecoder: JwtDecoder,
        jwtAuthenticationConverter: JwtAuthenticationConverter,
        requestCache: RequestCache
    ): SecurityFilterChain {
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
                    .requestMatchers("/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/oidc-login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/impressum").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/legal/privacy-text").permitAll()
                    .requestMatchers("/saml2/**").permitAll()
                    .requestMatchers("/login/saml2/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/graphql").authenticated()
                    .anyRequest().authenticated()
            }
            .formLogin(Customizer.withDefaults())
            .requestCache {
                it.requestCache(requestCache)
            }

        if (samlEnabled) {
            security = security
                .saml2Login {
                    it
                        .successHandler(samlAuthSuccessHandler)
                        .failureHandler(samlAuthFailureHandler)
                }
                .saml2Metadata { }
        }

        return security
            .oauth2ResourceServer {
                it.jwt { jwt ->
                    jwt.decoder(authorizationServerJwtDecoder)
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                }
            }
            .build()
    }
}
