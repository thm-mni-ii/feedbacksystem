package de.thm.ii.fbs.security

import de.thm.ii.fbs.model.v2.security.authorization.CourseRole
import de.thm.ii.fbs.services.persistence.CourseRegistrationService
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component

import scala.jdk.CollectionConverters.SeqHasAsJava

@Component("coursePermissions")
class CoursePermissionEvaluator {
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val userService: UserService = null // TODO remove

  def hasRole(courseId: Int, role: String): Boolean = {
    val userDetails = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails] // TODO User as UserDetails
    val user = userService.find(userDetails.getUsername)
    val participant = courseRegistrationService.getParticipants(courseId).find(_.getUser.getId == user.getId)
    participant match {
      case Some(p) => CourseRole.roleHierarchy().getReachableGrantedAuthorities(List(p.getRole).asJava).contains(CourseRole.parse(role))
      case None => false
    }
  }

  def subscribed(courseId: Int): Boolean = {
    val userDetails = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails] // TODO User as UserDetails
    val user = userService.find(userDetails.getUsername)
    courseRegistrationService.getParticipants(courseId).exists(_.getUser.getId == user.getId)
  }
}
