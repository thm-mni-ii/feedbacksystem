package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{Course, CourseRole, GlobalRole}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper._
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

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
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Get a course list
    *
    * @param ignoreHidden optional filter to filter only for visible courses
    * @param req          http request
    * @param res          http response
    * @return course list
    */
  @GetMapping(value = Array(""))
  @ResponseBody
  def getAll(@RequestParam(value = "visible", required = false) ignoreHidden: Boolean,
             req: HttpServletRequest, res: HttpServletResponse): List[Course] = {
    val user = authService.authorize(req, res)
    val courses = courseService.getAll(false)
    val courseRights = courseRegistrationService.getCoursePrivileges(user.id)
    user.globalRole match {
      case GlobalRole.ADMIN | GlobalRole.MODERATOR => courses
      case _ => courses
        .filter(c => c.visible || courseRights.getOrElse(c.id, CourseRole.STUDENT) != CourseRole.STUDENT)
    }
  }

  /**
    * Create a new course
    *
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Course = {
    if (authService.authorize(req, res).globalRole == GlobalRole.USER) {
      throw new ForbiddenException()
    }
    (
      body.retrive("semesterId").asInt(),
      body.retrive("name").asText(),
      body.retrive("description").asText(),
      body.retrive("visible").asBool()
    ) match {
      case (semesterId, Some(name), desc, visible) =>
        courseService.create(Course(name, desc.getOrElse(""), visible.getOrElse(true), semesterId = semesterId))
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Get a single course
    *
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

    courseService.find(cid) match {
      case Some(course) =>
        if (!(user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || isSubscribed || course.visible)) {
          throw new ForbiddenException()
        } else {
          course
        }
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Update course
    *
    * @param cid  Course id
    * @param req  http request
    * @param res  http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{cid}"))
  def update(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
        (
          body.retrive("semesterId").asInt(),
          body.retrive("name").asText(),
          body.retrive("description").asText(),
          body.retrive("visible").asBool()
        ) match {
          case (semesterId, Some(name), desc, visible) =>
            courseService.update(cid, Course(name, desc.getOrElse(""), visible.getOrElse(true), semesterId = semesterId))
          case _ => throw new BadRequestException("Malformed Request Body")
        }
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Delete course
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{cid}"))
  def delete(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
        // Save submissions and configurations
        val tasks = taskService.getAll(cid).map(t => (submissionService.getAllByTask(cid, t.id), checkerConfigurationService.getAll(cid, t.id)))

        val success = courseService.delete(cid)

        // If the Course was deleted in the database -> delete all files TODO1
        success && tasks.forall(t => t._1
          .forall(s => storageService.deleteSolution(s.id)) && t._2
          .forall(cc => storageService.deleteAllConfigurations(cc.taskId, cid, cc)))
      case _ => throw new ForbiddenException()
    }
  }


  /**
   * Update only the group selection of a course
   *
   * @param cid  Course id
   * @param req  http request
   * @param res  http response
   * @param body Request Body
   */
  @PutMapping(value = Array("/{cid}/groupSelection"))
  def updateGroupSelection(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
        (
          body.retrive("groupSelection").asBool(),
        ) match {
          case (Some(groupSelection)) =>
            courseService.updateGroupSelection(cid, groupSelection)
          case _ => throw new BadRequestException("Malformed Request Body")
        }
      case _ => throw new ForbiddenException()
    }
  }
}
