package de.thm.ii.fbs.utils.v2.security.authorization

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Annotation to check weather the current user is at least a moderator (global role)
 * or a docent in the course with the [courseId] of the annotated function.
 *
 * Note: The annotated function needs a parameter `courseId: Int` otherwise an internal server error occurs.
 *
 * @see PermissionEvaluator
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'DOCENT')")
annotation class IsModeratorOrCourseDocent

/**
 * Annotation to check weather the current user is  at least a moderator (global role)
 * or a docent in the course with the [courseId] or the current user has the same id as [userId] of the annotated function.
 *
 * Note: The annotated function needs the parameters `courseId: Int` and `userId: Int` otherwise an internal server error occurs.
 *
 * @see PermissionEvaluator
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'DOCENT') || @permissions.isSelf(#userId)")
annotation class IsModeratorOrCourseDocentOrSelf

/**
 * Annotation to check weather the current user is at least a moderator (global role)
 * or  at least a tutor in the course with the [courseId] of the annotated function.
 *
 * Note: The annotated function needs a parameter `courseId: Int` otherwise an internal server error occurs.
 *
 * @see PermissionEvaluator
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'TUTOR')")
annotation class IsModeratorOrCourseTutor

/**
 * Annotation to check weather the current user is  at least a moderator (global role)
 * or at least a tutor in the course with the [courseId] or the current user has the same id as [userId] of the annotated function.
 *
 * Note: The annotated function needs the parameters `courseId: Int` and `userId: Int` otherwise an internal server error occurs.
 *
 * @see PermissionEvaluator
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'TUTOR') || @permissions.isSelf(#userId)")
annotation class IsModeratorOrCourseTutorOrSelf

/**
 * Annotation to check weather the current user is at least a moderator (global role)
 * or at least a tutor in the course of the task with the [taskId] of the annotated function.
 *
 * Note: The annotated function needs a parameter `taskId: Int` otherwise an internal server error occurs.
 *
 * @see PermissionEvaluator
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRoleOfTask(#taskId, 'TUTOR')")
annotation class IsModeratorOrCourseTutorOfTask
