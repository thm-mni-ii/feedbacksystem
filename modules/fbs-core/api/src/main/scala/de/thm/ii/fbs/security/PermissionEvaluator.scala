package de.thm.ii.fbs.security

import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import jakarta.ws.rs.ForbiddenException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

import javax.servlet.http.HttpServletResponse
import scala.annotation.unused
import scala.jdk.CollectionConverters.SeqHasAsJava

/**
  * A spring component used to check permissions of the currently logged in user.
  */
@Component("permissions")
@unused
class PermissionEvaluator {
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null // TODO get course permissions from jwt token
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val authService: AuthService = null // TODO remove once roles are not encoded in the jwt token anymore

  /**
    * Returns true if the current user has at least the `role` in the course with `courseId`, false otherwise.
    *
    * @param courseId The course to check the user's role in.
    * @param role     The role to check on the user.
    */
  @unused
  def hasCourseRole(courseId: Int, role: CourseRole): Boolean = {
    val user = getUser
    val participant = courseRegistrationService.getCourseRoleOfUser(courseId, user.getId)
    participant match {
      case Some(userRole) => CourseRole.roleHierarchy().getReachableGrantedAuthorities(List(userRole).asJava).contains(role)
      case None => false
    }
  }

  /**
    * Returns true if the current user has at least the `role` in the course with `courseId`, false otherwise.
    *
    * @param courseId The course to check the user's role in.
    * @param role     The role as a string to check on the user.
    * @see hasCourseRole(Int, CourseRole)
    */
  @unused
  def hasCourseRole(courseId: Int, role: String): Boolean = hasCourseRole(courseId, CourseRole.parse(role))

  /**
    * Returns true if the current user has at least the `role` in the course of the task with `taskId`, false otherwise.
    *
    * @param taskId The task of the course to check the user's role in.
    * @param role   The role as a string to check on the user.
    * @see hasCourseRole(Int, CourseRole)
    */
  @unused
  def hasCourseRoleOfTask(taskId: Int, role: String): Boolean = {
    val task = taskService.getOne(taskId)
    task match {
      case Some(task) => hasCourseRole(task.courseID, role)
      case _ => false
    }
  }

  /**
    * Returns true if the current user is docent in any course, false otherwise.
    */
  @unused
  def hasDocentRole: Boolean = {
    courseRegistrationService.getCoursePrivileges(getUser.getId).exists(privileges => privileges._2 == CourseRole.DOCENT)
  }

  /**
    * Returns true if the current user is subscribed to the course with `courseId` (with any role), false otherwise.
    *
    * @param courseId The course to check the user's subscription to.
    */
  @unused
  def subscribed(courseId: Int): Boolean = courseRegistrationService.getCourseRoleOfUser(courseId, getUser.getId).isDefined

  /**
    * Returns true if the current user has the same `userId`, false otherwise.
    *
    * @param userId The user id to check with the current user.
    */
  @unused
  def isSelf(userId: Int): Boolean = {
    val user = getUser
    userId == user.getId
  }

  /**
    * Get the current logged in user.
    */
  @unused
  def getUser: User =
    SecurityContextHolder.getContext.getAuthentication match {
      case null => throw new ForbiddenException()
      case authentication: Authentication => authentication.getPrincipal.asInstanceOf[User]
    }

  /**
    * Get the current logged in user.
    */
  @unused
  def hasRole(role: GlobalRole): Boolean = {
    SecurityContextHolder.getContext.getAuthentication.getAuthorities.contains(role)
  }

  @unused
  def taskIsPrivate(taskId: Int): Boolean = {
    taskService.getOne(taskId) match {
      case Some(task) => task.isPrivate
      case None => false
    }
  }

  @unused
  def taskHideResults(taskId: Int): Boolean = {
    taskService.getOne(taskId) match {
      case Some(task) => task.hideResult
      case None => false
    }
  }

  def updateAuthToken(res: HttpServletResponse): Unit =
    authService.renewAuthentication(getUser, res)
}
