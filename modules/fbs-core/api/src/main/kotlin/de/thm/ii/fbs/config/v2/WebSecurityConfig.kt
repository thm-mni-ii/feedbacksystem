package de.thm.ii.fbs.config.v2

import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.SecurityFilterChain

@EnableWebSecurity
@EnableMethodSecurity
@Configuration
open class WebSecurityConfig(@Autowired val userRepository: UserRepository) {
    @Bean
    open fun configure(http: HttpSecurity): SecurityFilterChain {
        http.cors().and().csrf().disable().authorizeHttpRequests().regexMatchers(".*").authenticated().and().formLogin()
        return http.build()
    }

    @Bean
    open fun userDetailsService(): UserDetailsService = UserService(userRepository)
}
