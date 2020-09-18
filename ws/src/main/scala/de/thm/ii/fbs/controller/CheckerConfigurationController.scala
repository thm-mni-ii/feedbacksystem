package de.thm.ii.fbs.controller

import java.nio.file.Files

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, CourseRole, GlobalRole}
import de.thm.ii.fbs.services.persistance.{CheckerConfigurationService, CourseRegistrationService, StorageService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

/**
  * UserController defines all routes for /users (insert, delete, update)
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"))
class CheckerConfigurationController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val crs: CourseRegistrationService = null
  @Autowired
  private val ccs: CheckerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Return a list of checker configurations for a task
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @return List of configurations
    */
  @GetMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations"))
  @ResponseBody
  def getAll(@PathVariable cid: Int, @PathVariable tid: Int, req: HttpServletRequest, res: HttpServletResponse): List[CheckrunnerConfiguration] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      this.ccs.getAll(cid, tid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Create a new task configuration
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @param body Content
    * @return List of configurations
    */
  @PostMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(@PathVariable cid: Int, @PathVariable tid: Int, req: HttpServletRequest,
             res: HttpServletResponse, @RequestBody body: JsonNode): List[CheckrunnerConfiguration] = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("checkerType").asText(),
        body.retrive("ord").asInt()
      ) match {
        case (Some(checkerType), Some(ord)) => this.ccs.create(cid, tid, CheckrunnerConfiguration(checkerType, ord))
        case _ => throw new BadRequestException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Update a task configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Checker configuration id
    * @param req Http request
    * @param res Http response
    * @param body Content
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def update(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int, req: HttpServletRequest,
             res: HttpServletResponse, @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ( body.retrive("checkerType").asText(),
        body.retrive("ord").asInt()
      ) match {
        case (Some(checkerType), Some(ord)) => this.ccs.update(cid, tid, ccid, CheckrunnerConfiguration(checkerType, ord))
        case _ => throw new BadRequestException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Delete a task configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Checker configuration id
    * @param req Http request
    * @param res Http response
    */
  @DeleteMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}"))
  def delete(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      this.ccs.delete(cid, tid, ccid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Upload a the main file for a task configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Checker configuration id
    * @param req Http request
    * @param res Http response
    * @param file File content
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/main-file"))
  def updateMainFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int, req: HttpServletRequest, res: HttpServletResponse,
                    @RequestBody file: MultipartFile): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
        this.ccs.getAll(cid, tid).find(p => p.id == ccid) match {
          case Some(checkerConfiguration) =>
            val tempDesc = Files.createTempFile("fbs", ".tmp")
            file.transferTo(tempDesc)
            storageService.storeMainFile(tid, tempDesc)
            this.ccs.update(cid, tid, ccid, checkerConfiguration.copy(mainFileUploaded = true))
          case _ => throw new ResourceNotFoundException()
        }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Upload a the secondary file for a task configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Checker configuration id
    * @param req Http request
    * @param res Http response
    * @param file File content
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/secondary-file"))
  def updateSecondaryFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int, req: HttpServletRequest, res: HttpServletResponse,
                     @RequestBody file: MultipartFile): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      this.ccs.getAll(cid, tid).find(p => p.id == ccid) match {
        case Some(checkerConfiguration) =>
          val tempDesc = Files.createTempFile("fbs", ".tmp")
          file.transferTo(tempDesc)
          storageService.storeSecondaryFile(tid, tempDesc)
          this.ccs.update(cid, tid, ccid, checkerConfiguration.copy(mainFileUploaded = true))
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }
}
