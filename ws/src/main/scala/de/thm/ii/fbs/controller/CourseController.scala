package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{Course, CourseRole, GlobalRole}
import de.thm.ii.fbs.services.CourseService
import de.thm.ii.fbs.services.core.CourseService
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, CourseService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper._
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class CourseController {
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val authService: AuthService = null

  /**
    * Get a course list
    * @param visible optional filter to filter only for visible courses
    * @param req http request
    * @param res http response
    * @return course list
    */
  @GetMapping(value = Array(""))
  @ResponseBody
  def getAll(@RequestParam(value = "visible", required = false) visible: Boolean,
             req: HttpServletRequest, res: HttpServletResponse): List[Course] = {
    authService.authorize(req, res)
    courseService.getAll()
  }

  /**
    * Create a new course
    * @param req http request
    * @param res http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Course = {
    if (authService.authorize(req, res).globalRole == GlobalRole.USER) {
      throw new ForbiddenException()
    }
    ( body.retrive("name").asText(),
      body.retrive("description").asText(),
      body.retrive("visible").asBool()
    ) match {
      case (Some(name), desc, visible) =>
        courseService.create(Course(name, desc.getOrElse(""), visible.getOrElse(true)))
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Get a single course
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return A course
    */
  @GetMapping(value = Array("/{cid}"))
  @ResponseBody
  def getOne(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Course = {
    val user = authService.authorize(req, res)
    val isSubscribed = courseRegistrationService.getParticipants(cid).exists(_.user.id == user.id)
    if (!(user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || isSubscribed))  {
      throw new ForbiddenException()
    }
    courseService.find(cid) match {
      case Some(course) => course
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Update course
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{cid}"))
  def update(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse,
                   @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
        ( body.retrive("name").asText(),
          body.retrive("description").asText(),
          body.retrive("visible").asBool()
        ) match {
          case (Some(name), desc, visible) =>
            courseService.update(cid, Course(name, desc.getOrElse(""), visible.getOrElse(true)))
          case _ => throw new BadRequestException("Malformed Request Body")
        }
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Delete course
    * @param cid Course id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{cid}"))
  def delete(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) => courseService.delete(cid)
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Export course
    * @param cid Course id
    * @param req http request
    * @param res http response
    */
  @GetMapping(value = Array("/{cid}/export"))
  @ResponseBody
  def export(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = ??? // TODO: Impl
}
