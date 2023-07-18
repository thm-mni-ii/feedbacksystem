package de.thm.ii.fbs.utils.v2.security.authorization

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Annotation to check weather the current user is a moderator (global role)
 * or a docent in the course with the [courseID] of the annotated function.
 *
 * Note: The annotated function needs a parameter `courseId: Int` otherwise an internal server error occurs.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasRole(#courseId, 'DOCENT')")
annotation class IsModeratorOrCourseDocent

/**
 * Annotation to check weather the current user is a moderator (global role)
 * or a tutor in the course with the [courseID] of the annotated function.
 *
 * Note: The annotated function needs a parameter `courseId: Int` otherwise an internal server error occurs.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasRole(#courseId, 'TUTOR')")
annotation class IsModeratorOrCourseTutor