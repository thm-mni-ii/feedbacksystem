package de.thm.ii.fbs.controller

import de.thm.ii.fbs.services.persistence._

import java.io.File
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, SpreadsheetMediaInformation, SpreadsheetResponseInformation, SubtaskStatisticsTask, Task, UserTaskResult}
import de.thm.ii.fbs.services.checker.SpreadsheetService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.Hash
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
  @Autowired
  private val spreadsheetService: SpreadsheetService = null

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
    * Get a task list
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return course list
    */
  @GetMapping(value = Array("/{cid}/tasks/results"))
  @ResponseBody
  def getTaskResults(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse): Seq[UserTaskResult] = {
    val auth = authService.authorize(req, res)
    taskService.getTaskResults(cid, auth.id)
  }

  /**
    * Get subtask statistics
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return the subtask statistics
    */
  @GetMapping(value = Array("/{cid}/statistics/subtasks"))
  @ResponseBody
  def getSubtaskStatistics(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse): Seq[SubtaskStatisticsTask] = {
    val auth = authService.authorize(req, res)

    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == auth.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)
    val privileged = privilegedByCourse || auth.globalRole == GlobalRole.ADMIN || auth.globalRole == GlobalRole.MODERATOR

    if (!privileged) {
      throw new ForbiddenException()
    }

    taskService.getCourseSubtaskStatistics(cid)
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
    val user = authService.authorize(req, res)
    taskService.getOne(tid) match {
      case Some(task) => task.mediaInformation match {
        case Some(smi: SpreadsheetMediaInformation) =>
          val SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals) = smi
          val config = this.checkerConfigurationService.getAll(cid, tid).head
          val path = this.storageService.pathToMainFile(config.id).get.toString
          val spreadsheetFile = new File(path)
          val userID = Hash.decimalHash(user.username).abs().toString().slice(0, 7)
          val inputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, inputFields)
          val outputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, outputFields)
          task.copy(mediaInformation = Some(SpreadsheetResponseInformation(inputs, outputs.map(it => it._1),
            decimals, smi)))
        case _ => task
      }
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Get a task list
    *
    * @param tid Course id
    * @param req http request
    * @param res http response
    * @return course list
    */
  @GetMapping(value = Array("/{cid}/tasks/{tid}/result"))
  @ResponseBody
  def getTaskResult(@PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): Option[UserTaskResult] = {
    val auth = authService.authorize(req, res)
    taskService.getTaskResult(tid, auth.id)
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
        body.retrive("description").asText(),
        body.retrive("mediaInformation").asObject()
      ) match {
        case (Some(name), Some(deadline), Some("application/x-spreadsheet"), desc, Some(mediaInformation)) => (
          mediaInformation.retrive("idField").asText(),
          mediaInformation.retrive("inputFields").asText(),
          mediaInformation.retrive("outputFields").asText(),
          mediaInformation.retrive("pointFields").asText(),
          mediaInformation.retrive("decimals").asInt()
        ) match {
          case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.create(cid,
            Task(name, deadline, "application/x-spreadsheet", desc.getOrElse(""),
              Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals))))
          case _ => throw new BadRequestException("Malformed media information")
        }
        case (Some(name), Some(deadline), Some(mediaType), desc, _) => taskService.create(cid,
          Task(name, deadline, mediaType, desc.getOrElse(""), None))
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
        body.retrive("description").asText(),
        body.retrive("mediaInformation").asObject()
      ) match {
        case (Some(name), Some(deadline), Some("application/x-spreadsheet"), desc, Some(mediaInformation)) => (
          mediaInformation.retrive("idField").asText(),
          mediaInformation.retrive("inputFields").asText(),
          mediaInformation.retrive("outputFields").asText(),
          mediaInformation.retrive("pointFields").asText(),
          mediaInformation.retrive("decimals").asInt()
        ) match {
          case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.update(cid, tid,
            Task(name, deadline, "application/x-spreadsheet", desc.getOrElse(""),
              Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals))))
          case _ => throw new BadRequestException("Malformed media information")
        }
        case (Some(name), Some(deadline), Some(mediaType), desc, _) => taskService.update(cid, tid,
          Task(name, deadline, mediaType, desc.getOrElse(""), None))
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
