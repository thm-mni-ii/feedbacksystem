package de.thm.ii.fbs.config

import de.thm.ii.fbs.security.PreAuthenticatedFilter
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.security.authentication.{AuthenticationManager, UsernamePasswordAuthenticationToken}
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.{UserDetails, UserDetailsService}
import org.springframework.security.web.SecurityFilterChain


@EnableWebSecurity
@Configuration
class WebSecurityConfig(@Autowired private val userRepository: UserRepository) {
  @Bean
  def configure(http: HttpSecurity): SecurityFilterChain = {
    http.cors().and()
      .csrf().disable()
      .addFilterBefore(customUsernamePasswordAuthenticationFilter(), classOf[PreAuthenticatedFilter])
      //.authorizeRequests().expressionHandler(webSecurityExpressionHandler())
      //.and()
      .authorizeHttpRequests()

      .antMatchers(
        "/api/v1/login/**",
        "/",
        "/*.js",
        "/*.css",
        "/*.woff2",
        "/favicon.ico",
        "/*.jpg",
        "/*.png",
        "/assets/**"
      ).permitAll().anyRequest().authenticated()
    http.build()
  }

  @Bean
  def userDetailsService(): UserDetailsService = new UserService(userRepository)

  @Bean
  def customersAuthenticationManager(): AuthenticationManager = {
    (authentication: Authentication) => {
      UsernamePasswordAuthenticationToken.authenticated(
        authentication.getPrincipal,
        authentication.getCredentials,
        authentication.getPrincipal.asInstanceOf[UserDetails].getAuthorities
      )
    }
  }

  @Bean
  def customUsernamePasswordAuthenticationFilter(): PreAuthenticatedFilter = {
    val customUsernamePasswordAuthenticationFilter = new PreAuthenticatedFilter()
    customUsernamePasswordAuthenticationFilter.setAuthenticationManager(customersAuthenticationManager())
    customUsernamePasswordAuthenticationFilter
  }
}
