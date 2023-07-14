/*
package de.thm.ii.fbs.model.v2.security.authorization

import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole.Companion.ADMIN
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole.Companion.MODERATOR
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole.Companion.USER
import org.springframework.context.annotation.Bean
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler

import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.access.hierarchicalroles.RoleHierarchy

import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl

//@Bean
fun roleHierarchy(): RoleHierarchy {
    val hierarchy = RoleHierarchyImpl()
    hierarchy.setHierarchy("${ADMIN.authority} > ${MODERATOR.authority}} \n ${MODERATOR.authority} > ${USER.authority}")
    return hierarchy
}

//@Bean
fun methodSecurityExpressionHandler(roleHierarchy: RoleHierarchy?): MethodSecurityExpressionHandler {
    val expressionHandler = DefaultMethodSecurityExpressionHandler()
    expressionHandler.setRoleHierarchy(roleHierarchy)
    return expressionHandler
}*/
