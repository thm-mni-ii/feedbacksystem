package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.{BadRequestException, ConflictException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.task.SubTaskResult
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Submission}
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.{MinioStorageService, StorageService}
import de.thm.ii.fbs.services.security.AuthService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

import java.io.File
import java.nio.file.{Files, StandardOpenOption}
import java.time.Instant
import java.util
import java.util.Optional
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.collection.convert.ImplicitConversions.`collection AsScalaIterable`

/**
  * Submission controller implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/users"))
class SubmissionController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val checkerServiceFactoryService: CheckerServiceFactoryService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val checkrunnerSubTaskServer: CheckrunnerSubTaskService = null
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null
  private val objectMapper = new ObjectMapper();
  private val logger = LoggerFactory.getLogger(this.getClass)

  /**
    * Get a list of all submissions for a task
    *
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @return Submission results
    */
  @GetMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions"))
  @ResponseBody
  def getAll(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
             req: HttpServletRequest, res: HttpServletResponse): List[Submission] = {
    val user = authService.authorize(req, res)
    val task = taskService.getOne(tid).get

    val adminPrivileged = (user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
      || List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)))
    val privileged = (user.id == uid && !task.isPrivate) || adminPrivileged

    if (privileged) {
      submissionService.getAll(uid, cid, tid, adminPrivileged || task.mediaType == "application/x-spreadsheet")
        .map(submission => submissionService.getOrHidden(submission, task.hideResult, adminPrivileged))
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get a list of all submissions for a task
    *
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param sid Submission id
    * @param req Http request
    * @param res Http response
    * @return Submission results
    */
  @GetMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}/subresults"))
  @ResponseBody
  def getSubresults(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
                    @PathVariable("sid") sid: Int, req: HttpServletRequest, res: HttpServletResponse): List[SubTaskResult] = {
    val user = authService.authorize(req, res)
    val task = taskService.getOne(tid).get

    val adminPrivileged = (user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
      || List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)))
    val privileged = (user.id == uid && !task.isPrivate) || adminPrivileged

    if (!privileged) {
      throw new ForbiddenException()
    }

    if (task.hideResult && !adminPrivileged) {
      List()
    } else {
      checkerConfigurationService.getAll(cid, tid).headOption match {
        case Some(cc) => checkrunnerSubTaskServer.listResultsWithTasks(uid, cc.id, sid)
        case None => throw new ResourceNotFoundException()
      }
    }
  }

  /**
    * Submit a file for a task
    *
    * @param uid  User id
    * @param cid  Course id
    * @param tid  Task id
    * @param file Mutipart file
    * @param req  Http request
    * @param res  Http response
    * @return Submission information
    */
  @PostMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions"))
  @ResponseBody
  def submit(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
             @RequestParam file: MultipartFile, @RequestParam additionalInformation: Optional[String],
             @RequestParam("checkerOrders") checkerOrders: Optional[util.List[String]],
             req: HttpServletRequest, res: HttpServletResponse): Submission = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, user.id)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && user.globalRole != GlobalRole.ADMIN

    if (user.id == uid) {
      this.taskService.getOne(tid) match {
        case Some(task) =>
          // Not allow Students to Submit to Private Tasks
          if (noPrivateAccess && task.isPrivate) {
            throw new ForbiddenException()
          }

          val expectedMediaType = task.mediaType
          val currentMediaType = req.getContentType // Transform to media type (Content Type != Media Type)
          if (task.deadline.isDefined && Instant.now().isAfter(Instant.parse(task.deadline.get))) {
            throw new BadRequestException("Deadline Before Now")
          }
          if (true) { // TODO: Check media type compatibility
            val submission = submissionService.create(uid, tid,
              Option(additionalInformation.orElse(null)).map(ai => objectMapper.readValue(ai, classOf[util.HashMap[String, Any]])))
            minioStorageService.storeSolutionFileInBucket(submission.id, file)

            checkerConfigurationService.getAll(cid, tid).foreach(cc => {
              if (checkerOrders.isEmpty || checkerOrders.get().contains(cc.ord.toString)) {
                val checkerService = checkerServiceFactoryService(cc.checkerType)
                checkerService.notify(tid, submission.id, cc, user)
              }
            })
            submission

          } else {
            throw new BadRequestException("Unsupported Media Type")
          }
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Restart the submission process
    *
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param sid Task id
    * @param req Http request
    * @param res Http response
    * @return
    */
  @PutMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}"))
  def resubmit(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int, @PathVariable("sid") sid: Int,
               @RequestParam("checkerOrders") checkerOrders: Optional[util.List[String]],
               req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val task = taskService.getOne(tid).get
    val someCourseRole = courseRegistration.getCourseRoleOfUser(cid, user.id)
    val noPrivateAccess = someCourseRole.contains(CourseRole.STUDENT) && user.globalRole != GlobalRole.ADMIN

    val allowed = user.id == uid && !(noPrivateAccess && task.isPrivate)
    if (allowed) {
      submissionService.getOne(sid, uid) match {
        case Some(submission) =>
          if (!submission.isInBlockStorage) {
            throw new ConflictException("resubmit is not supported for this submission")
          }

          checkerConfigurationService.getAll(cid, tid).foreach(cc => {
            if (checkerOrders.isEmpty || checkerOrders.get().contains(cc.ord.toString)) {
              val checkerService = checkerServiceFactoryService(cc.checkerType)
              checkerService.notify(tid, submission.id, cc, user)
            }
          })
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Restart the submission process for all submissions of task
    *
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @return
    */
  @PostMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/resubmitAll"))
  def resubmitAll(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
                  req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)

    val adminPrivileged = (user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
      || List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)))

    if (adminPrivileged) {
      submissionService.getAllByTask(cid, tid).filter(s => s.isInBlockStorage).foreach(submission => {
        submissionService.clearResults(submission.id, submission.userID.get)
        checkerConfigurationService.getAll(cid, tid).foreach(cc => {
          val checkerService = checkerServiceFactoryService(cc.checkerType)
          checkerService.notify(tid, submission.id, cc, user)
        })
      })
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get the status of submission
    *
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param sid Task id
    * @param req Http request
    * @param res Http response
    * @return A submission state
    */
  @GetMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}"))
  @ResponseBody
  def getOne(@PathVariable uid: Int, @PathVariable cid: Int, @PathVariable tid: Int, @PathVariable sid: Int,
             req: HttpServletRequest, res: HttpServletResponse): Submission = {
    val user = authService.authorize(req, res)
    val task = taskService.getOne(tid).get

    val adminPrivileged = (user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
      || List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)))
    val privileged = (user.id == uid && !task.isPrivate) || adminPrivileged

    if (privileged) {
      submissionService.getOne(sid, uid, adminPrivileged) match {
        case Some(submission) =>
          submissionService.getOrHidden(submission, task.hideResult, adminPrivileged)
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  @GetMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}/content"))
  @ResponseBody
  def getContent(@PathVariable uid: Int, @PathVariable cid: Int, @PathVariable tid: Int, @PathVariable sid: Int,
                 req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)
    val task = taskService.getOne(tid).get

    val privileged = user.id == uid || user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
      List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT))

    if (privileged) {
      submissionService.getOne(sid, uid) match {
        case Some(submission) => {
          val file: File = storageService.getFileSolutionFile(submission)
          val (ctype, ext) = task.getExtensionFromMimeType(storageService.getContentTypeSolutionFile(submission))
          ResponseEntity.ok()
            .contentType(ctype)
            .contentLength(file.length())
            .header("Content-Disposition", s"attachment;filename=submission_${task.id}_${submission.id}$ext")
            .body(new InputStreamResource(Files.newInputStream(file.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
        }
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ResourceNotFoundException()
    }
  }

  @GetMapping(value = Array("/courses/{cid}/tasks/submissions/content"))
  @ResponseBody
  def solutionsOfCourse(@PathVariable cid: Int,
                        req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)

    val privileged = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
      List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT))

    if (privileged) {
      val f = File.createTempFile("tmp", "")
      submissionService.writeSubmissionsOfCourseToFile(f, cid)
      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(f.length())
        .header("Content-Disposition", s"attachment;filename=course_$cid.zip")
        .body(new InputStreamResource(Files.newInputStream(f.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
    } else {
      throw new ResourceNotFoundException()
    }
  }

  @GetMapping(value = Array("/courses/{cid}/tasks/{tid}/submissions/content"))
  @ResponseBody
  def solutionsOfTask(@PathVariable cid: Int, @PathVariable tid: Int,
                      req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val user = authService.authorize(req, res)

    val privileged = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
      List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT))

    if (privileged) {
      val f = new File("tmp")
      submissionService.writeSubmissionsOfTaskToFile(f, cid, tid)
      ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(f.length())
        .header("Content-Disposition", s"attachment;filename=task_$tid.zip")
        .body(new InputStreamResource(Files.newInputStream(f.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
    } else {
      throw new ResourceNotFoundException()
    }
  }
}
