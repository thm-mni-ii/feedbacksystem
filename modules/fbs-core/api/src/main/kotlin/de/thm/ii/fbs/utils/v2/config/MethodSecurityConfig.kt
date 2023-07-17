package de.thm.ii.fbs.utils.v2.config

import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole
import de.thm.ii.fbs.utils.v2.security.authorization.DenyMethodSecurityMetadataSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.access.method.MethodSecurityMetadataSource
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
open class MethodSecurityConfig : GlobalMethodSecurityConfiguration() {

    companion object {
        @Bean
        fun methodSecurityExpressionHandler(): MethodSecurityExpressionHandler {
            val handler = DefaultMethodSecurityExpressionHandler()
            handler.setRoleHierarchy(GlobalRole.roleHierarchy())
            return handler
        }
    }

    override fun customMethodSecurityMetadataSource(): MethodSecurityMetadataSource = DenyMethodSecurityMetadataSource()
}
