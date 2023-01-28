package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, TaskImportFiles}
import de.thm.ii.fbs.services.`export`.{TaskExportService, TaskImportService}
import de.thm.ii.fbs.services.persistence.CourseRegistrationService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.Archiver
import de.thm.ii.fbs.util.Archiver.logger
import org.apache.commons.compress.archivers.ArchiveStreamFactory
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import org.apache.commons.io.FileUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, PostMapping, RequestBody, RequestParam, ResponseBody, RestController}
import org.springframework.web.multipart.MultipartFile

import java.io.{BufferedWriter, File, FileWriter}
import java.nio.charset.{Charset, StandardCharsets}
import java.nio.file.Files
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

@RestController
@GetMapping(path = Array("/api/v1/courses/{cid}"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class ImportController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val taskExportService: TaskExportService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val taskImportService: TaskImportService = null
  private val logger = LoggerFactory.getLogger(this.getClass)


  @PostMapping(value = Array("/tasks/import"))
  @ResponseBody
  def importTasks(@PathVariable(value = "cid", required = true) cid: Int, @RequestParam("file") body: MultipartFile,
                  req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val (taskImportFiles, _) = Archiver.unpack(cid, body.getInputStream)

      logger.info(taskImportFiles.toString)
      taskImportService.createTask(cid, taskImportFiles)
    } else {
      throw new ForbiddenException()
    }
  }

  @PostMapping(value = Array("/tasks/import/list"))
  @ResponseBody
  def importTaskList(@PathVariable(value = "cid", required = true) cid: Int, @RequestParam("file") body: MultipartFile,
                     req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      val (_, taskImportFiles: List[TaskImportFiles]) = Archiver.unpack(cid, body.getInputStream)

      logger.info(taskImportFiles.toString)
      taskImportFiles.foreach(tif => taskImportService.createTask(cid, tif))
    } else {
      throw new ForbiddenException()
    }
  }


}
