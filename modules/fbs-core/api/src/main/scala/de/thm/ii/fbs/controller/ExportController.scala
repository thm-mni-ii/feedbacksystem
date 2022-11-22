package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.`export`.TaskExportService
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, StorageService}
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, ResponseBody, RestController}

import java.io.{File, FileInputStream}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

@RestController
@GetMapping(path = Array("/api/v1/export"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class ExportController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val taskExportService: TaskExportService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val storageService: StorageService = null

  @GetMapping(value = Array("/{cid}/{taskId}"))
  @ResponseBody
  def getTask(@PathVariable(value = "taskId", required = true) taskId: Int,
              @PathVariable(value = "cid", required = true) cid: Int,
              req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val file = new File(taskExportService.exportTask(taskId))
      val resource = new InputStreamResource(new FileInputStream(file))

      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(file.length())
        .header("Content-Disposition", s"attachment;filename=task_$taskId.fbs-export")
        .body(resource)
    } else {
      throw new ForbiddenException()
    }
  }
}
