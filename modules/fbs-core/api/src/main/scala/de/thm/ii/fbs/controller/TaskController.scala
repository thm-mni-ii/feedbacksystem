package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.task.{Task, TaskBatch}
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.checker.math.SpreadsheetService
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.Hash
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

import java.io.File
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

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
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
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
    val auth = authService.authorize(req, res)
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, auth.getId)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && auth.getGlobalRole != GlobalRole.ADMIN

    if (noPrivateAccess) {
      taskService.getAll(cid).filter(task => !task.isPrivate)
    } else {
      taskService.getAll(cid)
    }
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
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, auth.getId)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && auth.getGlobalRole != GlobalRole.ADMIN

    if (noPrivateAccess) {
      taskService.getTaskResults(cid, auth.getId).filter(res => !res.isPrivate)
    } else {
      taskService.getTaskResults(cid, auth.getId)
    }
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

    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.getUser.getId == auth.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)
    val privileged = privilegedByCourse || auth.getGlobalRole == GlobalRole.ADMIN || auth.getGlobalRole == GlobalRole.MODERATOR

    if (!privileged) {
      throw new ForbiddenException()
    }

    taskService.getCourseSubtaskStatistics(cid)
  }

  /**
    * Get a single task
    *
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
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, user.getId)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && user.getGlobalRole != GlobalRole.ADMIN

    val task = taskService.getOne(tid) match {
      case Some(task) =>
        task.mediaInformation match {
          case Some(smi: SpreadsheetMediaInformation) =>
            val SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals) = smi
            val config = this.checkerConfigurationService.getAll(cid, tid).head
            val spreadsheetFile: File = storageService.getFileMainFile(config)
            val userID = Hash.decimalHash(user.getUsername).abs().toString().slice(0, 7)
            val inputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, inputFields)
            val outputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, outputFields)
            spreadsheetFile.delete()
            task.copy(mediaInformation = Some(SpreadsheetResponseInformation(inputs, outputs.map(it => it._1),
              decimals, smi)))
          case _ => task
        }
      case _ => throw new ResourceNotFoundException()
    }

    if (noPrivateAccess && task.isPrivate) {
      throw new ForbiddenException()
    } else {
      task
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
  def getTaskResult(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): UserTaskResult = {
    val auth = authService.authorize(req, res)
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, auth.getId)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && auth.getGlobalRole != GlobalRole.ADMIN

    val taskResult = taskService.getTaskResult(tid, auth.getId).getOrElse(throw new ResourceNotFoundException())

    if (noPrivateAccess && taskResult.isPrivate) {
      throw new ForbiddenException()
    } else {
      taskResult
    }
  }

  /**
    * Create a new task
    *
    * @param cid  Course id
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array("/{cid}/tasks"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(@PathVariable("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Task = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.getUser.getId == user.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)

    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      (body.retrive("name").asText(),
        body.retrive("isPrivate").asBool(),
        body.retrive("deadline").asText(),
        body.retrive("mediaType").asText(),
        body.retrive("description").asText(),
        body.retrive("mediaInformation").asObject(),
        body.retrive("requirementType").asText() match {
          case Some(t) if Task.requirementTypes.contains(t) => t
          case None => Task.defaultRequirement
          case _ => throw new BadRequestException("Invalid requirement type.")
        },
        body.retrive("attempts").asInt(),
        body.retrive("hideResult").asBool()

      ) match {
        case (Some(name), isPrivate, deadline, Some("application/x-spreadsheet"), desc, Some(mediaInformation), requirementType, attempts, hideResult) => (
          mediaInformation.retrive("idField").asText(),
          mediaInformation.retrive("inputFields").asText(),
          mediaInformation.retrive("outputFields").asText(),
          mediaInformation.retrive("pointFields").asText(),
          mediaInformation.retrive("decimals").asInt()
        ) match {
          case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.create(cid,
            Task(name, deadline, "application/x-spreadsheet", isPrivate.getOrElse(false), desc.getOrElse(""),
              Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals)), requirementType,
              attempts = attempts, hideResult = hideResult.getOrElse(false)))
          case _ => throw new BadRequestException("Malformed media information")
        }
        case (Some(name), isPrivate, deadline, Some(mediaType), desc, _, requirementType, attempts, hideResult) => taskService.create(cid,
          Task(name, deadline, mediaType, isPrivate.getOrElse(false), desc.getOrElse(""), None, requirementType, attempts = attempts,
            hideResult = hideResult.getOrElse(false)))
        case _ => throw new BadRequestException("Malformed Request Body")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Update task
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param req  http request
    * @param res  http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}"), consumes = Array())
  def update(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.getUser.getId == user.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)

    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      (body.retrive("name").asText(),
        body.retrive("deadline").asText(),
        body.retrive("mediaType").asText(),
        body.retrive("isPrivate").asBool(),
        body.retrive("description").asText(),
        body.retrive("mediaInformation").asObject(),
        body.retrive("requirementType").asText() match {
          case Some(t) if Task.requirementTypes.contains(t) => t
          case None => Task.defaultRequirement
          case _ => throw new BadRequestException("Invalid requirement type.")
        },
        body.retrive("attempts").asInt(),
        body.retrive("hideResult").asBool()

      ) match {
        case (Some(name), deadline, Some("application/x-spreadsheet"), isPrivate, desc, Some(mediaInformation), requirementType, attempts, hideResult) => (
          mediaInformation.retrive("idField").asText(),
          mediaInformation.retrive("inputFields").asText(),
          mediaInformation.retrive("outputFields").asText(),
          mediaInformation.retrive("pointFields").asText(),
          mediaInformation.retrive("decimals").asInt()
        ) match {
          case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.update(cid, tid,
            Task(name, deadline, "application/x-spreadsheet", isPrivate.getOrElse(false), desc.getOrElse(""),
              Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals)), requirementType,
              attempts = attempts, hideResult = hideResult.getOrElse(false)))
          case _ => throw new BadRequestException("Malformed media information")
        }
        case (Some(name), deadline, Some(mediaType), isPrivate, desc, _, requirementType, attempts, hideResult) => taskService.update(cid, tid,
          Task(name, deadline, mediaType, isPrivate.getOrElse(false), desc.getOrElse(""), None, requirementType, attempts = attempts,
            hideResult = hideResult.getOrElse(false)))
        case _ => throw new BadRequestException("Malformed Request Body")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Batch update tasks
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @param body     Request Body
    */
  @PutMapping(value = Array("/{courseId}/tasks"), consumes = Array())
  def updateBatch(@PathVariable("courseId") courseId: Int, req: HttpServletRequest, res: HttpServletResponse,
                  @RequestBody body: TaskBatch): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(courseId).find(_.getUser.getId == user.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)

    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      taskService.updateBatch(courseId, body)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Delete a task
    *
    * @param cid Course id
    * @param tid Task id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{cid}/tasks/{tid}"))
  def delete(@PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.getUser.getId == user.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)

    if (user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      // Save submissions and configurations
      val submissions = submissionService.getAllByTask(cid, tid)
      val configurations = checkerConfigurationService.getAll(cid, tid)

      val success = taskService.delete(cid, tid)

      // If the configuration was deleted in the database -> delete all files
      if (success) {
        submissions.foreach(s => storageService.deleteSolution(s.id))
        configurations.foreach(cc => storageService.deleteAllConfigurations(tid, cid, cc))
      }
    } else {
      throw new ForbiddenException()
    }
  }
}
