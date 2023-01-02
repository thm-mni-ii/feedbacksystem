package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole}
import de.thm.ii.fbs.services.`export`.TaskExportService
import de.thm.ii.fbs.services.persistence.CourseRegistrationService
import de.thm.ii.fbs.services.security.AuthService
import org.apache.commons.io.FileUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, PostMapping, RequestBody, RequestParam, ResponseBody, RestController}
import org.springframework.web.multipart.MultipartFile

import java.io.File
import java.nio.charset.{Charset, StandardCharsets}
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
  private val logger = LoggerFactory.getLogger(this.getClass)


  @PostMapping(value = Array("/tasks/import"))
  @ResponseBody
  def importTasks(@PathVariable(value = "cid", required = true) cid: Int, @RequestParam("file") body: MultipartFile,
                  req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      // die conig files fehlen noch

      val f = new File("tmp/")
      FileUtils.writeStringToFile(f, body.toString, Charset.forName("UTF-8"))

      //logger.info(body.getFile.isDirectory.toString)
      logger.info(body.getResource.getFile.isHidden.toString)
      logger.info(body.getResource.getFile.isDirectory.toString)
      body.getResource.getFile.list().foreach(f => logger.info(f))
      val str = new String(body.getBytes, StandardCharsets.UTF_8)
      val files = str.split("\\./")
      files.foreach(f => logger.info(f))
      logger.info(files.length.toString)

      //val f = new File("tmp/")
      //FileUtils.writeStringToFile(f, files, Charset.forName("UTF-8"))

      /*(body..getResource..retrive("main-file").asObject(), // main config
        body.retrive("secondary-file").asObject(), // sec config
        body.retrive().asObject() // task
      ) match {
        case (Some(main), Some(secondary), Some(task)) => {
          test(task)
          createMainFile(main)
          createSecondaryFile(secondary)
        }
      }*/
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
