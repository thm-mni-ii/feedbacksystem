package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.`export`.{TaskExportService, TaskImportService}
import de.thm.ii.fbs.services.persistence.CourseRegistrationService
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.Archiver
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
      val taskImportFiles = Archiver.unpack(cid, body.getInputStream)

      taskImportService.createTask(cid, taskImportFiles)
    } else {
      throw new ForbiddenException()
    }
  }

  @PostMapping(value = Array("/tasks/import/list"))
  @ResponseBody
  def importTaskList(@PathVariable(value = "cid", required = true) cid: Int, @RequestBody body: List[InputStreamResource],
                     req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      /*body.asObject().foreach(files =>
        (files.retrive("main-file").asObject(), // main config
          files.retrive("").asObject(), // sec config
          files.retrive("").asObject() // task
        ) match {
          case (Some(main), Some(secondary), Some(task)) => {
            test(task)
            createMainFile(main)
            createSecondaryFile(secondary)
          }
        })*/
    } else {
      throw new ForbiddenException()
    }
  }

  /*private def test(body: JsonNode): Unit = {
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
      }
    ) match {
      case (Some(name), isPrivate, deadline, Some("application/x-spreadsheet"), desc, Some(mediaInformation), requirementType) => (
        mediaInformation.retrive("idField").asText(),
        mediaInformation.retrive("inputFields").asText(),
        mediaInformation.retrive("outputFields").asText(),
        mediaInformation.retrive("pointFields").asText(),
        mediaInformation.retrive("decimals").asInt()
      ) match {
        case (Some(idField), Some(inputFields), Some(outputFields), pointFields, Some(decimals)) => taskService.create(cid,
          Task(name, deadline, "application/x-spreadsheet", isPrivate.getOrElse(false), desc.getOrElse(""),
            Some(SpreadsheetMediaInformation(idField, inputFields, outputFields, pointFields, decimals)), requirementType))
        case _ => throw new BadRequestException("Malformed media information")
      }
      case (Some(name), isPrivate, deadline, Some(mediaType), desc, _, requirementType) => taskService.create(cid,
        Task(name, deadline, mediaType, isPrivate.getOrElse(false), desc.getOrElse(""), None, requirementType))
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }*/


}
