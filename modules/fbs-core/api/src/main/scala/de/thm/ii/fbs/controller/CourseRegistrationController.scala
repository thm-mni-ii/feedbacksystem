package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.Course
import de.thm.ii.fbs.model.v2.course.Participant
import de.thm.ii.fbs.model.v2.security.authorization.CourseRole
import de.thm.ii.fbs.security.PermissionEvaluator
import de.thm.ii.fbs.services.persistence.CourseRegistrationService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.utils.v2.security.authorization.{IsModeratorOrCourseDocent, IsModeratorOrCourseDocentOrSelf, IsModeratorOrCourseTutor}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Handles course registration and course participants
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class CourseRegistrationController {
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null

  /**
    * Get registered courses
    *
    * @param userId User id
    * @param req    http request
    * @param res    http response
    * @return List of courses
    */
  @GetMapping(value = Array("/users/{userId}/courses"))
  @ResponseBody
  @PreAuthorize("hasRole('MODERATOR') || @permissions.isSelf(#userId)")
  def getRegisteredCourses(@PathVariable userId: Integer, req: HttpServletRequest, res: HttpServletResponse): List[Course] =
    courseRegistrationService.getRegisteredCourses(userId, ignoreHidden = false)

  /**
    * Get participants of a course
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @return List of courses
    */
  @GetMapping(value = Array("/courses/{courseId}/participants"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getParticipants(@PathVariable courseId: Integer, req: HttpServletRequest, res: HttpServletResponse): List[Participant] =
    courseRegistrationService.getParticipants(courseId)

  /**
    * Register a user into a course
    *
    * @param userId   User id
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @param body     Content
    */
  @PutMapping(value = Array("/users/{userId}/courses/{courseId}"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @IsModeratorOrCourseDocentOrSelf
  def register(@PathVariable userId: Int, @PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse,
               @RequestBody body: JsonNode): Unit = {
    val role = Option(body).flatMap(_.retrive("roleName").asText()).map(CourseRole.parse).getOrElse(CourseRole.STUDENT)

    if (PermissionEvaluator.hasCourseRole(courseId, CourseRole.TUTOR)) {
      courseRegistrationService.register(courseId, userId, role)
    } else if (PermissionEvaluator.isSelf(userId)) {
      courseRegistrationService.register(courseId, userId, CourseRole.STUDENT)
    } else {
      new ForbiddenException()
    }
  }

  /**
    * Deregister a user from a course
    *
    * @param userId   Course id
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    */
  @DeleteMapping(value = Array("/users/{userId}/courses/{courseId}"))
  @IsModeratorOrCourseDocentOrSelf
  def deregister(@PathVariable("userId") userId: Int, @PathVariable("courseId") courseId: Int, req: HttpServletRequest, res: HttpServletResponse): Unit =
    courseRegistrationService.deregister(courseId, userId)

  /**
    * Deregister all users with a specific role from a course
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @param body     Content
    */
  @PutMapping(value = Array("/courses/{courseId}/deregisterrole"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @IsModeratorOrCourseDocent
  def deregisterRole(@PathVariable("courseId") courseId: Int, req: HttpServletRequest, res: HttpServletResponse,
                     @RequestBody body: JsonNode): Unit = {
    val role = Option(body).flatMap(_.retrive("roleName").asText()).map(CourseRole.parse).getOrElse(CourseRole.STUDENT)
    courseRegistrationService.deregisterRole(courseId, role)
  }

  /**
    * Deregister all user except the current user
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    */
  @GetMapping(value = Array("/courses/{courseId}/deregisterall"))
  @IsModeratorOrCourseDocent
  def deregisterAll(@PathVariable("courseId") courseId: Int, req: HttpServletRequest, res: HttpServletResponse): Unit =
    courseRegistrationService.deregisterAll(courseId, PermissionEvaluator.getUser.getId)
}
