package de.thm.ii.fbs.utils.v2.security.authorization

import org.springframework.core.annotation.AnnotationUtils
import org.springframework.core.annotation.MergedAnnotations
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.access.annotation.Jsr250SecurityConfig
import org.springframework.security.access.method.AbstractFallbackMethodSecurityMetadataSource
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import java.lang.reflect.Method

class DenyMethodSecurityMetadataSource : AbstractFallbackMethodSecurityMetadataSource() {
    override fun findAttributes(clazz: Class<*>?): Collection<ConfigAttribute>? {
        return null
    }

    override fun findAttributes(method: Method, targetClass: Class<*>?): Collection<ConfigAttribute>? {
        val methodAnnotations = MergedAnnotations.from(method)
        val classAnnotations = targetClass?.let { MergedAnnotations.from(it) } ?: MergedAnnotations.of(listOf())
        val attributes: MutableList<ConfigAttribute> = ArrayList()

        // if the class is annotated as @Controller we should by default deny access to every method
        if (targetClass?.let {
            AnnotationUtils.findAnnotation(
                    it,
                    Controller::class.java
                )
        } != null && onlyLocal(targetClass)
        ) {
            attributes.add(Jsr250SecurityConfig.DENY_ALL_ATTRIBUTE)
        }
        // but not if the method or the target class has at least a PreAuthorize or PostAuthorize annotation
        if (hasPreOrPost(methodAnnotations) || hasPreOrPost(classAnnotations)) {
            return null
        }
        return attributes
    }

    override fun getAllConfigAttributes(): Collection<ConfigAttribute>? {
        return null
    }

    private fun onlyLocal(targetClass: Class<*>): Boolean =
        targetClass.packageName.startsWith("de.thm.ii.fbs") &&
            targetClass.simpleName != "LoginController"

    private fun hasPreOrPost(annotations: MergedAnnotations): Boolean =
        annotations.isPresent(PreAuthorize::class.java) || annotations.isPresent(PostAuthorize::class.java)
}
