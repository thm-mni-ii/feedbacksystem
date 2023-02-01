package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException}
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Task}
import de.thm.ii.fbs.services.`export`.TaskExportService
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.apache.commons.io.FileUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, PostMapping, RequestBody, RequestParam, ResponseBody, RestController}
import org.springframework.web.multipart.MultipartFile

import java.io.{ByteArrayInputStream, File, InputStream, SequenceInputStream}
import java.nio.charset.{Charset, StandardCharsets}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

@RestController
@GetMapping(path = Array("/api/v1/courses/{cid}"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
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

  @GetMapping(value = Array("/tasks/{taskId}/export"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def exportTask(@PathVariable(value = "taskId", required = true) taskId: Int,
                 @PathVariable(value = "cid", required = true) cid: Int,
                 req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val (contentLength, resource) = taskExportService.responseFromTaskId(List(), true, taskId)
      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(contentLength)
        .header("Content-Disposition", s"attachment;filename=task_$taskId.fbs-export")
        .body(resource)
    } else {
      throw new ForbiddenException()
    }
  }

  @PostMapping(value = Array("/tasks/export"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def exportAllTasksFromList(@PathVariable(value = "cid", required = true) cid: Int, @RequestBody body: JsonNode,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      body.retrive("taskIds").asObject() match {
        case Some(taskIds) => {
          if (taskIds.isArray) {
            logger.info(taskIds.toString)
            var list: List[Task] = List()
            taskIds.forEach(id => {
              val t = taskService.getOne(id.asInt()).get
              list ::= t
              logger.info(t.toString)
            })
            logger.info(list.toString())
            val (contentLength, resource) = taskExportService.responseFromTaskId(list, false, -1)

            ResponseEntity.ok()
              .contentType(MediaType.APPLICATION_OCTET_STREAM)
              .contentLength(contentLength)
              .header("Content-Disposition", s"attachment;filename=course_${cid}_only.fbs-export")
              .body(resource)
          } else {
            throw new BadRequestException("No task ids provided")
          }
        }
        case _ => throw new BadRequestException("No tasks selected")
      }
    } else {
      throw new ForbiddenException()
    }
  }

  @GetMapping(value = Array("/tasks/export/all"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def exportAllTasksOfCourse(@PathVariable(value = "cid", required = true) cid: Int,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val (contentLength, resource) = taskExportService.responseFromTaskId(taskService.getAll(cid), false, -1)
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
