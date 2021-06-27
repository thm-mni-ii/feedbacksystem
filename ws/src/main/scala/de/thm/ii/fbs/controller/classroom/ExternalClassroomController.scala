package de.thm.ii.fbs.controller.classroom

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException}
import de.thm.ii.fbs.model.{Course, GlobalRole}
import de.thm.ii.fbs.services.classroom.ClassroomService
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, PostMapping, RequestBody, RequestMapping, ResponseBody, RestController}

import java.net.URI
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * External classroom controller
  * @param authService: The autowired AuthService
  * @param classroomService: The autowired ClassroomService
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/classroom"))
class ExternalClassroomController(private val authService: AuthService,
                                  private val classroomService: ClassroomService) {
  /**
    * Let's a user join a classroom. An instance is created on demand.
    * @param req http request
    * @param res http response
    * @param courseId the courseId
    * @return JSON
    */
  @GetMapping(value = Array("/{courseId}/join"))
  def joinClassroom(req: HttpServletRequest, res: HttpServletResponse, @PathVariable courseId: Int): URI = {
    val user = authService.authorize(req, res)
    classroomService.joinUser(courseId, user)
  }

  /**
    * A user left the classroom
    * @param req http request
    * @param res http response
    * @param courseId the courseId
    * @return JSON
    */
  @GetMapping(value = Array("/{courseId}/leave"))
  def leaveClassroom(req: HttpServletRequest, res: HttpServletResponse, @PathVariable courseId: Int): Boolean = {
    val user = authService.authorize(req, res)
    classroomService.leaveUser(courseId, user)
  }

}
