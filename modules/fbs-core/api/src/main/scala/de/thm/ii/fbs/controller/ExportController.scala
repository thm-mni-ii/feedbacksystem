package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException}
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.`export`.TaskExportService
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

import java.util
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.jdk.CollectionConverters.IterableHasAsScala

@RestController
@GetMapping(path = Array("/api/v1/courses/{cid}"))
class ExportController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val taskExportService: TaskExportService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val taskService: TaskService = null
  private val logger = LoggerFactory.getLogger(this.getClass)
  val objectMapper = new ScalaObjectMapper

  @GetMapping(value = Array("/tasks/{taskId}/export"))
  @ResponseBody
  def exportTask(@PathVariable(value = "taskId", required = true) taskId: Int,
                 @PathVariable(value = "cid", required = true) cid: Int,
                 req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val task: Task = taskService.getOne(taskId).get
      val (contentLength, resource) = taskExportService.responseFromTaskId(List(task))
      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(contentLength)
        .header("Content-Disposition", s"attachment;filename=task_$taskId.fbs-export")
        .body(resource)
    } else {
      throw new ForbiddenException()
    }
  }

  @PostMapping(value = Array("/tasks/export"))
  @ResponseBody
  def exportAllTasksFromList(@PathVariable(value = "cid", required = true) cid: Int, @RequestBody body: JsonNode,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      body.retrive("taskIds").asObject() match {
        case Some(taskIds) =>
          if (taskIds.isArray) {
            val tasks: List[Int] = objectMapper.readerForListOf(classOf[Int]).readValue[util.ArrayList[Int]](taskIds).asScala.toList
            val list: List[Task] = tasks.map(id => taskService.getOne(id).get)
            val (contentLength, resource) = taskExportService.responseFromTaskId(list)

            ResponseEntity.ok()
              .contentType(MediaType.APPLICATION_OCTET_STREAM)
              .contentLength(contentLength)
              .header("Content-Disposition", s"attachment;filename=course_${cid}_only.fbs-export")
              .body(resource)
          } else {
            throw new BadRequestException("No task ids provided")
          }
        case _ => throw new BadRequestException("No tasks selected")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  @GetMapping(value = Array("/tasks/export/all"))
  @ResponseBody
  def exportAllTasksOfCourse(@PathVariable(value = "cid", required = true) cid: Int,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val (contentLength, resource) = taskExportService.responseFromTaskId(taskService.getAll(cid))
      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(contentLength)
        .header("Content-Disposition", s"attachment;filename=course_${cid}_all.fbs-export")
        .body(resource)
    } else {
      throw new ForbiddenException()
    }
  }
}
