package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.BadRequestException
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.services.`export`.TaskExportService
import de.thm.ii.fbs.services.persistence.TaskService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.util.ScalaObjectMapper
import de.thm.ii.fbs.utils.v2.security.authorization.IsModeratorOrCourseTutor
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

import java.util
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.jdk.CollectionConverters.IterableHasAsScala

@RestController
@GetMapping(path = Array("/api/v1/courses/{courseId}"))
class ExportController {
  @Autowired
  private val taskExportService: TaskExportService = null
  @Autowired
  private val taskService: TaskService = null
  val objectMapper = new ScalaObjectMapper

  @GetMapping(value = Array("/tasks/{taskId}/export"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def exportTask(@PathVariable taskId: Int, @PathVariable courseId: Int,
                 req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val task: Task = taskService.getOne(taskId).get
    val (contentLength, resource) = taskExportService.responseFromTaskId(List(task))
    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(contentLength)
      .header("Content-Disposition", s"attachment;filename=task_$taskId.fbs-export")
      .body(resource)
  }

  @PostMapping(value = Array("/tasks/export"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def exportAllTasksFromList(@PathVariable courseId: Int, @RequestBody body: JsonNode,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    body.retrive("taskIds").asObject() match {
      case Some(taskIds) =>
        if (taskIds.isArray) {
          val tasks: List[Int] = objectMapper.readerForListOf(classOf[Int]).readValue[util.ArrayList[Int]](taskIds).asScala.toList
          val list: List[Task] = tasks.map(id => taskService.getOne(id).get)
          val (contentLength, resource) = taskExportService.responseFromTaskId(list)

          ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .contentLength(contentLength)
            .header("Content-Disposition", s"attachment;filename=course_${courseId}_only.fbs-export")
              .body(resource)
          } else {
            throw new BadRequestException("No task ids provided")
          }
        case _ => throw new BadRequestException("No tasks selected")
      }
  }

  @GetMapping(value = Array("/tasks/export/all"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def exportAllTasksOfCourse(@PathVariable courseId: Int,
                             req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val (contentLength, resource) = taskExportService.responseFromTaskId(taskService.getAll(courseId))
    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(contentLength)
      .header("Content-Disposition", s"attachment;filename=course_${courseId}_all.fbs-export")
      .body(resource)
  }
}
