package de.thm.ii.fbs.services.security

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, User}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessageHeaderAccessor
import org.springframework.stereotype.Component

/**
  * Authentication service
  *
  * @author Andrej Sajenko
  */
@Component
class CourseAuthService {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null

    /**
      * Get Global User data by STOMP Head Accessor
      * @param headerAccessor headAccessor
      * @return Option[User]
      */
   def getGlobalUser(headerAccessor: SimpMessageHeaderAccessor): Option[User] =
    this.userService.find(headerAccessor.getUser.getName)

  /**
    * Get Course User data by STOMP Head Accessor and message payload
    * @param headerAccessor headAccessor
    * @param payload payload
    * @return Option[User]
    */
   def getCourseUser(headerAccessor: SimpMessageHeaderAccessor, payload: JsonNode): Option[User] =
    this.courseRegistrationService.getParticipants(payload.retrive("courseId").asInt().get)
      .find(_.user.username == headerAccessor.getUser.getName).map(_.user)
  /**
    * Checks if user is privileged in course
    * @param courseID courseid
    * @param user user
    * @return Boolean indicating if the user is priviledged
    */
   def isPrivilegedInCourse(courseID: Int, user: User): Boolean =
    if (user.globalRole >= GlobalRole.MODERATOR) {
      true
    } else {
      val courseUser = this.courseRegistrationService.getParticipants(courseID).find(_.user.id == user.id)
      if (courseUser.isEmpty) {
        false
      } else {
        courseUser.get.role >= CourseRole.TUTOR
      }
    }
}
