package de.thm.ii.fbs.controller

import java.util.Date

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Task}
import de.thm.ii.fbs.services.core.{CourseRegistrationService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.util.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * TaskController implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"))
class TaskController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null

  /**
    * Get a task list
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return course list
    */
  @RequestMapping(value = Array("/{cid}/tasks"), method = Array(RequestMethod.GET))
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
  @RequestMapping(value = Array("/{cid}/tasks/{tid}"), method = Array(RequestMethod.GET))
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
  @RequestMapping(value = Array("/{cid}/tasks"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def create(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Task = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("name").asText(),
        body.retrive("deadline").asLong(),
        body.retrive("description").asText()
      ) match {
        case (Some(name), Some(deadline), desc) => taskService.create(cid, Task(name, new Date(deadline), desc.getOrElse("")))
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
  @RequestMapping(value = Array("/{cid}/tasks/{tid}"), method = Array(RequestMethod.PUT), consumes = Array())
  @ResponseBody
  def update(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("name").asText(),
        body.retrive("deadline").asLong(),
        body.retrive("description").asText()
      ) match {
        case (Some(name), Some(deadline), desc) => taskService.update(cid, tid, Task(name, new Date(deadline), desc.getOrElse("")))
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
  @RequestMapping(value = Array("/{cid}/tasks/{tid}"), method = Array(RequestMethod.DELETE))
  @ResponseBody
  def delete(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      taskService.delete(cid, tid)
    } else {
      throw new ForbiddenException()
    }
  }
}
