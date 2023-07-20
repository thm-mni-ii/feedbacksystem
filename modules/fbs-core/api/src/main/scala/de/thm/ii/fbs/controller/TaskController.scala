package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.task.{Task, TaskBatch}
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.security.PermissionEvaluator
import de.thm.ii.fbs.services.checker.math.SpreadsheetService
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.Hash
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.utils.v2.security.authorization.{IsModeratorOrCourseTutor, IsUser}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.{PostAuthorize, PostFilter}
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
  private val taskService: TaskService = null
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
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @return course list
    */
  @GetMapping(value = Array("/{courseId}/tasks"))
  @ResponseBody
  @IsUser
  @PostFilter("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR')" +
    " || (@permissions.hasCourseRole(#courseId, 'STUDENT') && !filterObject.isPrivate)")
  def getAll(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): List[Task] = {
    taskService.getAll(courseId)
  }

  /**
    * Get a task list
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @return course list
    */
  @GetMapping(value = Array("/{courseId}/tasks/results"))
  @ResponseBody
  @IsUser
  @PostFilter("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR')" +
    " || (@permissions.hasCourseRole(#courseId, 'STUDENT') && !filterObject.isPrivate)")
  def getTaskResults(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): Seq[UserTaskResult] =
    taskService.getTaskResults(courseId, PermissionEvaluator.getUser.getId)

  /**
    * Get subtask statistics
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @return the subtask statistics
    */
  @GetMapping(value = Array("/{courseId}/statistics/subtasks"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getSubtaskStatistics(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): Seq[SubtaskStatisticsTask] =
    taskService.getCourseSubtaskStatistics(courseId)

  /**
    * Get a single task
    *
    * @param courseId Course id
    * @param taskId   Task id
    * @param req      http request
    * @param res      http response
    * @return A course
    */
  @GetMapping(value = Array("/{courseId}/tasks/{taskId}"))
  @ResponseBody
  @IsUser
  @PostAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR')" +
    " || (@permissions.hasCourseRole(#courseId, 'STUDENT') && !returnObject.isPrivate)")
  def getOne(@PathVariable courseId: Int, @PathVariable taskId: Int, req: HttpServletRequest, res: HttpServletResponse): Task =
    taskService.getOne(taskId) match {
      case Some(task) =>
        task.mediaInformation match {
          case Some(smi: SpreadsheetMediaInformation) =>
            val SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals) = smi
            val config = this.checkerConfigurationService.getAll(courseId, taskId).head
            val spreadsheetFile: File = storageService.getFileMainFile(config)
            val userID = Hash.decimalHash(PermissionEvaluator.getUser.getUsername).abs().toString().slice(0, 7)
            val inputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, inputFields)
            val outputs = this.spreadsheetService.getFields(spreadsheetFile, idField, userID, outputFields)
            spreadsheetFile.delete()
            task.copy(mediaInformation = Some(SpreadsheetResponseInformation(inputs, outputs.map(it => it._1),
              decimals, smi)))
          case _ => task
        }
      case _ => throw new ResourceNotFoundException()
    }

  /**
    * Get a task list
    *
    * @param taskId Course id
    * @param req    http request
    * @param res    http response
    * @return course list
    */
  @GetMapping(value = Array("/{courseId}/tasks/{taskId}/result"))
  @ResponseBody
  @IsUser
  @PostAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR')" +
    " || (@permissions.hasCourseRole(#courseId, 'STUDENT') && !returnObject.isPrivate)")
  def getTaskResult(@PathVariable courseId: Int, @PathVariable taskId: Int, req: HttpServletRequest, res: HttpServletResponse): UserTaskResult =
    taskService.getTaskResult(taskId, PermissionEvaluator.getUser.getId).getOrElse(throw new ResourceNotFoundException())

  /**
    * Create a new task
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @param body     contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array("/{courseId}/tasks"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def create(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Task =
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
        case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.create(courseId,
          Task(name, deadline, "application/x-spreadsheet", isPrivate.getOrElse(false), desc.getOrElse(""),
            Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals)), requirementType,
            attempts = attempts, hideResult = hideResult.getOrElse(false)))
        case _ => throw new BadRequestException("Malformed media information")
      }
      case (Some(name), isPrivate, deadline, Some(mediaType), desc, _, requirementType, attempts, hideResult) => taskService.create(courseId,
        Task(name, deadline, mediaType, isPrivate.getOrElse(false), desc.getOrElse(""), None, requirementType, attempts = attempts,
          hideResult = hideResult.getOrElse(false)))
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Update task
    *
    * @param courseId Course id
    * @param taskId   Task id
    * @param req      http request
    * @param res      http response
    * @param body     Request Body
    */
  @PutMapping(value = Array("/{courseId}/tasks/{taskId}"), consumes = Array())
  @IsModeratorOrCourseTutor
  def update(@PathVariable courseId: Int, @PathVariable taskId: Int, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit =
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
        case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.update(courseId, taskId,
          Task(name, deadline, "application/x-spreadsheet", isPrivate.getOrElse(false), desc.getOrElse(""),
            Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals)), requirementType,
            attempts = attempts, hideResult = hideResult.getOrElse(false)))
        case _ => throw new BadRequestException("Malformed media information")
      }
      case (Some(name), deadline, Some(mediaType), isPrivate, desc, _, requirementType, attempts, hideResult) => taskService.update(courseId, taskId,
        Task(name, deadline, mediaType, isPrivate.getOrElse(false), desc.getOrElse(""), None, requirementType, attempts = attempts,
          hideResult = hideResult.getOrElse(false)))
      case _ => throw new BadRequestException("Malformed Request Body")
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
  @IsModeratorOrCourseTutor
  def updateBatch(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse,
                  @RequestBody body: TaskBatch): Unit =
    taskService.updateBatch(courseId, body)

  /**
    * Delete a task
    *
    * @param courseId Course id
    * @param taskId   Task id
    * @param req      http request
    * @param res      http response
    */
  @DeleteMapping(value = Array("/{courseId}/tasks/{taskId}"))
  @IsModeratorOrCourseTutor
  def delete(@PathVariable courseId: Int, @PathVariable taskId: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    // Save submissions and configurations
    val submissions = submissionService.getAllByTask(courseId, taskId)
    val configurations = checkerConfigurationService.getAll(courseId, taskId)

    val success = taskService.delete(courseId, taskId)

    // If the configuration was deleted in the database -> delete all files
    if (success) {
      submissions.foreach(s => storageService.deleteSolution(s.id))
      configurations.foreach(cc => storageService.deleteAllConfigurations(taskId, courseId, cc))
    }
  }
}
