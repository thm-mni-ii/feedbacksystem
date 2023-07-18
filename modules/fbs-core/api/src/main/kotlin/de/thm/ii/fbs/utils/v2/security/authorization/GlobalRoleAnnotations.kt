package de.thm.ii.fbs.utils.v2.security.authorization
import org.springframework.security.access.prepost.PreAuthorize

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("permitAll")
annotation class PermitAll

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
annotation class IsAdmin

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR')")
annotation class IsModerator

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('USER')")
annotation class IsUser

/**
 * Annotation to check weather the current user has the same id as [userId] of the annotated function.
 *
 * Note: The annotated function needs a parameter `userId: Int` otherwise an internal server error occurs.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@IsUser
@PreAuthorize("@permissions.isSelf(#userId)")
annotation class IsSelf
