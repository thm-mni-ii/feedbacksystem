package de.thm.ii.fbs.controller

import java.text.SimpleDateFormat
import java.util.Date

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Task}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * TaskController implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class TaskController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Get a task list
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return course list
    */
  @GetMapping(value = Array("/{cid}/tasks"))
  @ResponseBody
  def getAll(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse): List[Task] = {
    authService.authorize(req, res)
    taskService.getAll(cid)
  }

  /**
    * Get a single task
    * @param cid Course id
    * @param tid Task id
    * @param req http request
    * @param res http response
    * @return A course
    */
  @GetMapping(value = Array("/{cid}/tasks/{tid}"))
  @ResponseBody
  def getOne(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): Task = {
    authService.authorize(req, res)
    taskService.getOne(tid) match {
      case Some(task) => task
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Create a new task
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array("/{cid}/tasks"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Task = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("name").asText(),
        body.retrive("deadline").asText(),
        body.retrive("mediaType").asText(),
        body.retrive("description").asText()
      ) match {
        case (Some(name), Some(deadline), Some(mediaType), desc) => taskService.create(cid,
          Task(name, deadline, mediaType, desc.getOrElse("")))
        case _ => throw new BadRequestException("Malformed Request Body")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Update task
    * @param cid Course id
    * @param tid Task id
    * @param req http request
    * @param res http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}"), consumes = Array())
  def update(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("name").asText(),
        body.retrive("deadline").asText(),
        body.retrive("mediaType").asText(),
        body.retrive("description").asText()
      ) match {
        case (Some(name), Some(deadline), Some(mediaType), desc) => taskService.update(cid, tid,
          Task(name, deadline, mediaType, desc.getOrElse("")))
        case _ => throw new BadRequestException("Malformed Request Body")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Delete a task
    * @param cid Course id
    * @param tid Task id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{cid}/tasks/{tid}"))
  def delete(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      // Save submissions and configurations
      val submissions = submissionService.getAllByTask(cid, tid)
      val configurations = checkerConfigurationService.getAll(cid, tid)

      val success = taskService.delete(cid, tid)

      // If the configuration was deleted in the database -> delete all files
      success && submissions.forall(s => storageService.deleteSolutionFile(s.id)) &&
        configurations.forall(cc => storageService.deleteConfiguration(cc.id))
    } else {
      throw new ForbiddenException()
    }
  }
}
