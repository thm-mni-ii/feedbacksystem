package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceOnChange, CheckerServiceOnDelete, CheckerServiceOnMainFileUpload}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

import java.nio.file.Path
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

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
  private val ccs: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkerService: CheckerServiceFactoryService = null
  @Autowired
  private val minioService: MinioService = null

  /**
    * Return a list of checker configurations for a task
    *
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
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param req  Http request
    * @param res  Http response
    * @param body Content
    * @return List of configurations
    */
  @PostMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(@PathVariable cid: Int, @PathVariable tid: Int, req: HttpServletRequest,
             res: HttpServletResponse, @RequestBody body: JsonNode): CheckrunnerConfiguration = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      (body.retrive("checkerType").asText(),
        body.retrive("ord").asInt(),
        body.retrive("checkerTypeInformation").asObject(),
      ) match {
        case (Some(checkerType), Some(ord), Some(checkerTypeInformation)) =>
          (checkerTypeInformation.retrive("showHints").asBool(),
            checkerTypeInformation.retrive("showHintsAt").asInt(), checkerTypeInformation.retrive("showExtendedHints").asBool(),
            checkerTypeInformation.retrive("showExtendedHintsAt").asInt()) match {
            case (Some(showHints), Some(showHintsAt), Some(showExtendedHints), Some(showExtendedHintsAt)) =>
              val cc = CheckrunnerConfiguration(checkerType, ord, checkerTypeInformation =
                Some(SqlCheckerInformation("", showHints, showHintsAt, showExtendedHints, showExtendedHintsAt)))
              notifyChecker(tid, cc)
              val ccc = this.ccs.create(cid, tid, cc)
              notifyChecker(tid, ccc)
              ccc
            case _ => throw new BadRequestException("Malformed checker type information")
          }
        case (Some(checkerType), Some(ord), _) =>
          val cc = CheckrunnerConfiguration(checkerType, ord)
          notifyChecker(tid, cc)
          this.ccs.create(cid, tid, cc)
        case _ => throw new BadRequestException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Update a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param req  Http request
    * @param res  Http response
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
      (body.retrive("checkerType").asText(),
        body.retrive("ord").asInt(),
        body.retrive("checkerTypeInformation").asObject()
      ) match {
        case (Some(checkerType), Some(ord), Some(checkerTypeInformation)) =>
          (checkerTypeInformation.retrive("showHints").asBool(),
            checkerTypeInformation.retrive("showHintsAt").asInt(), checkerTypeInformation.retrive("showExtendedHints").asBool(),
            checkerTypeInformation.retrive("showExtendedHintsAt").asInt()) match {
            case (Some(showHints), Some(showHintsAt), Some(showExtendedHints), Some(showExtendedHintsAt)) =>
              val cc = CheckrunnerConfiguration(checkerType, ord, checkerTypeInformation =
                Some(SqlCheckerInformation("", showHints, showHintsAt, showExtendedHints, showExtendedHintsAt)))
              notifyChecker(tid, cc)
              this.ccs.update(cid, tid, ccid, cc)
            case _ => throw new BadRequestException("Malformed checker type information")
          }
        case (Some(checkerType), Some(ord), _) =>
          val cc = CheckrunnerConfiguration(checkerType, ord)
          notifyChecker(tid, cc)
          this.ccs.update(cid, tid, ccid, cc)
        case _ => throw new BadRequestException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Delete a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param req  Http request
    * @param res  Http response
    */
  @DeleteMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}"))
  def delete(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)
    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      ccs.getOne(ccid) match {
        case Some(cc) =>
          if (ccs.delete(cid, tid, cc.id)) {
            storageService.deleteAllConfigurations(tid, cid, cc)
          }
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Upload a the main file for a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param file Multipart file
    * @param req  Http request
    * @param res  Http response
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/main-file"))
  def updateMainFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int,
                     @RequestParam file: MultipartFile,
                     req: HttpServletRequest, res: HttpServletResponse): Unit =
    uploadFile(storageFileName.MAIN_FILE,
      cc => {
        notifyCheckerMainFileUpload(cid, taskService.getOne(tid).get, cc)
        this.ccs.setMainFileUploadedState(cid, tid, ccid, state = true)
      })(cid, tid, ccid, file, req, res)

  /**
    * Downloads the main file for a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param req  Http request
    * @param res  Http response
    */
  @GetMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/main-file"))
  def getMainFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int,
                  req: HttpServletRequest, res: HttpServletResponse): Unit =
    getFile(storageService.pathToMainFile)(storageFileName.MAIN_FILE, cid, tid, ccid, req, res)

  /**
    * Upload a the secondary file for a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param file Multipart file
    * @param req  Http request
    * @param res  Http response
    */
  @PutMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/secondary-file"))
  def uploadSecondaryFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int,
                          @RequestParam file: MultipartFile,
                          req: HttpServletRequest, res: HttpServletResponse): Unit =
    uploadFile(storageFileName.SECONDARY_FILE,
      cc => this.ccs.setSecondaryFileUploadedState(cid, tid, ccid, state = true))(cid, tid, ccid, file, req, res)

  /**
    * Downloads the secondary file for a task configuration
    *
    * @param cid  Course id
    * @param tid  Task id
    * @param ccid Checker configuration id
    * @param req  Http request
    * @param res  Http response
    */
  @GetMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}/secondary-file"))
  def getSecondaryFile(@PathVariable cid: Int, @PathVariable tid: Int, @PathVariable ccid: Int,
                       req: HttpServletRequest, res: HttpServletResponse): Unit =
    getFile(storageService.pathToSecondaryFile)(storageFileName.SECONDARY_FILE, cid, tid, ccid, req, res)

  private def uploadFile(fileName: String, postHook: CheckrunnerConfiguration => Unit)
                        (cid: Int, tid: Int, ccid: Int, file: MultipartFile, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      this.ccs.find(cid, tid, ccid) match {
        case Some(checkerConfiguration) =>
          storageService.storeConfigurationFileInBucket(ccid, file, fileName)
          postHook(checkerConfiguration)
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  private def getFile(pathFn: Int => Option[Path])(fileName: String, cid: Int, tid: Int, ccid: Int,
                                                   req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privilegedByCourse = crs.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || privilegedByCourse) {
      this.ccs.getAll(cid, tid).find(p => p.id == ccid) match {
        case Some(checkrunnerConfiguration) =>
          val mainFileInputStream = storageService.getFileContentStream(pathFn)(checkrunnerConfiguration.isInBlockStorage, ccid, tid, fileName)
          mainFileInputStream.transferTo(res.getOutputStream)
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  private def notifyChecker(tid: Int, cc: CheckrunnerConfiguration): Unit = {
    val checker = checkerService(cc.checkerType)
    checker match {
      case change: CheckerServiceOnChange =>
        change.onCheckerConfigurationChange(taskService.getOne(tid).get, cc)
      case _ =>
    }
  }

  private def notifyCheckerMainFileUpload(cid: Int, task: Task, cc: CheckrunnerConfiguration): Unit = {
    val checker = checkerService(cc.checkerType)
    checker match {
      case change: CheckerServiceOnMainFileUpload =>
        change.onCheckerMainFileUpload(cid, task, cc)
      case _ =>
    }
  }

  private def notifyCheckerDelete(tid: Int, cc: CheckrunnerConfiguration): Unit = {
    val checker = checkerService(cc.checkerType)
    checker match {
      case change: CheckerServiceOnDelete =>
        change.onCheckerConfigurationDelete(taskService.getOne(tid).get, cc)
      case _ =>
    }
  }
}
