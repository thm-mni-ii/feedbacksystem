package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.{BadRequestException, ConflictException, ResourceNotFoundException}
import de.thm.ii.fbs.model.Submission
import de.thm.ii.fbs.model.task.SubTaskResult
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.security.PermissionEvaluator
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.{MinioStorageService, StorageService}
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import de.thm.ii.fbs.utils.v2.security.authorization.{IsModeratorOrCourseTutor, IsModeratorOrCourseTutorOrSelf, IsSelf}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.security.access.prepost.{PostFilter, PreAuthorize}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

import java.io.File
import java.nio.file.{Files, StandardOpenOption}
import java.time.Instant
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.jdk.CollectionConverters.SeqHasAsJava

/**
  * Submission controller implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/users"))
class SubmissionController {
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
  @Autowired
  private val permissionEvaluator: PermissionEvaluator = null

  /**
    * Get a list of all submissions for a task
    *
    * @param userId   User id
    * @param courseId Course id
    * @param taskId   Task id
    * @param req      Http request
    * @param res      Http response
    * @return Submission results
    */
  @GetMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions"))
  @ResponseBody
  @IsModeratorOrCourseTutorOrSelf
  def getAll(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int,
             req: HttpServletRequest, res: HttpServletResponse): List[Submission] = {
    val task = taskService.getOne(taskId).get

    val adminPrivileged = permissionEvaluator.hasRole(GlobalRole.MODERATOR) || permissionEvaluator.hasCourseRole(courseId, CourseRole.TUTOR)

    submissionService.getAll(userId, courseId, taskId, adminPrivileged || task.mediaType == "application/x-spreadsheet")
      .map(submission => submissionService.getOrHidden(submission, task.hideResult, adminPrivileged))
  }

  /**
    * Get a list of all submissions for a task
    *
    * @param userId       User id
    * @param courseId     Course id
    * @param taskId       Task id
    * @param submissionId Submission id
    * @param req          Http request
    * @param res          Http response
    * @return Submission results
    */
  @GetMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions/{submissionId}/subresults"))
  @ResponseBody
  @PreAuthorize("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'TUTOR')" +
    " || (@permissions.isSelf(#userId) && !@permissions.taskIsPrivate(#taskId))")
  @PostFilter("hasRole('MODERATOR') || @permissions.hasCourseRole(#courseId, 'TUTOR') || !@permissions.taskHideResult(#taskId)")
  def getSubresults(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int,
                    @PathVariable submissionId: Int, req: HttpServletRequest, res: HttpServletResponse): java.util.List[SubTaskResult] =
    checkerConfigurationService.getAll(courseId, taskId).headOption match {
      case Some(cc) => new java.util.ArrayList[SubTaskResult](checkrunnerSubTaskServer.listResultsWithTasks(userId, cc.id, submissionId).asJava)
      case None => throw new ResourceNotFoundException()
    }

  /**
    * Submit a file for a task
    *
    * @param userId   User id
    * @param courseId Course id
    * @param taskId   Task id
    * @param file     Mutipart file
    * @param req      Http request
    * @param res      Http response
    * @return Submission information
    */
  @PostMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions"))
  @ResponseBody
  @IsSelf
  // Do not allow Students to Submit to Private Tasks
  @PreAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR') || !@permissions.taskIsPrivate(#taskId)")
  def submit(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int,
             @RequestParam file: MultipartFile,
             req: HttpServletRequest, res: HttpServletResponse): Submission =
    this.taskService.getOne(taskId) match {
      case Some(task) =>
        if (task.deadline.isDefined && Instant.now().isAfter(Instant.parse(task.deadline.get))) {
          throw new BadRequestException("Deadline Before Now")
        }
        // TODO: Check media type compatibility
        val submission = submissionService.create(userId, taskId)
        minioStorageService.storeSolutionFileInBucket(submission.id, file)
        checkerConfigurationService.getAll(courseId, taskId).foreach(cc => {
          val checkerService = checkerServiceFactoryService(cc.checkerType)
          checkerService.notify(taskId, submission.id, cc, permissionEvaluator.getUser)
        })
        submission

      case _ => throw new ResourceNotFoundException()
    }

  /**
    * Restart the submission process
    *
    * @param userId       User id
    * @param courseId     Course id
    * @param taskId       Task id
    * @param submissionId Task id
    * @param req          Http request
    * @param res          Http response
    * @return
    */
  @PutMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions/{submissionId}"))
  @IsSelf
  // Do not allow Students to resubmit to Private Tasks
  @PreAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR') || !@permissions.taskIsPrivate(#taskId)")
  def resubmit(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int, @PathVariable submissionId: Int,
               req: HttpServletRequest, res: HttpServletResponse): Unit =
    submissionService.getOne(submissionId, userId) match {
      case Some(submission) =>
        if (!submission.isInBlockStorage) {
          throw new ConflictException("resubmit is not supported for this submission")
        }

        submissionService.clearResults(submissionId, userId)
        checkerConfigurationService.getAll(courseId, taskId).foreach(cc => {
          val checkerService = checkerServiceFactoryService(cc.checkerType)
          checkerService.notify(taskId, submissionId, cc, permissionEvaluator.getUser)
        })
      case None => throw new ResourceNotFoundException()
    }

  /**
    * Restart the submission process for all submissions of task
    *
    * @param courseId Course id
    * @param taskId   Task id
    * @param req      Http request
    * @param res      Http response
    * @return
    */
  @PostMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/resubmitAll"))
  @IsModeratorOrCourseTutor
  def resubmitAll(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int,
                  req: HttpServletRequest, res: HttpServletResponse): Unit =
    submissionService.getAllByTask(courseId, taskId).filter(s => s.isInBlockStorage).foreach(submission => {
      submissionService.clearResults(submission.id, submission.userID.get)
      checkerConfigurationService.getAll(courseId, taskId).foreach(cc => {
        val checkerService = checkerServiceFactoryService(cc.checkerType)
        checkerService.notify(taskId, submission.id, cc, permissionEvaluator.getUser)
      })
    })

  /**
    * Get the status of submission
    *
    * @param userId       User id
    * @param courseId     Course id
    * @param taskId       Task id
    * @param submissionId Task id
    * @param req          Http request
    * @param res          Http response
    * @return A submission state
    */
  @GetMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions/{submissionId}"))
  @ResponseBody
  @IsSelf
  // Do not allow Students to get submissions of Private Tasks
  @PreAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR') || !@permissions.taskIsPrivate(#taskId)")
  def getOne(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int, @PathVariable submissionId: Int,
             req: HttpServletRequest, res: HttpServletResponse): Submission = {
    val task = taskService.getOne(taskId).get

    val adminPrivileged = permissionEvaluator.hasRole(GlobalRole.MODERATOR) || permissionEvaluator.hasCourseRole(courseId, CourseRole.TUTOR)

    submissionService.getOne(submissionId, userId, adminPrivileged) match {
      case Some(submission) =>
        submissionService.getOrHidden(submission, task.hideResult, adminPrivileged)
      case None => throw new ResourceNotFoundException()
    }
  }

  @GetMapping(value = Array("/{userId}/courses/{courseId}/tasks/{taskId}/submissions/{submissionId}/content"))
  @ResponseBody
  @IsSelf
  // Do not allow Students to get contents of submissions of Private Tasks
  @PreAuthorize("hasRole('ADMIN') || @permissions.hasCourseRole(#courseId, 'TUTOR') || !@permissions.taskIsPrivate(#taskId)")
  def getContent(@PathVariable userId: Int, @PathVariable courseId: Int, @PathVariable taskId: Int, @PathVariable submissionId: Int,
                 req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val task = taskService.getOne(taskId).get

    submissionService.getOne(submissionId, userId) match {
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
  }

  @GetMapping(value = Array("/courses/{courseId}/tasks/submissions/content"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def solutionsOfCourse(@PathVariable courseId: Int,
                        req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val f = File.createTempFile("tmp", "")
    submissionService.writeSubmissionsOfCourseToFile(f, courseId)
    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(f.length())
      .header("Content-Disposition", s"attachment;filename=course_$courseId.zip")
      .body(new InputStreamResource(Files.newInputStream(f.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
  }

  @GetMapping(value = Array("/courses/{courseId}/tasks/{taskId}/submissions/content"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def solutionsOfTask(@PathVariable courseId: Int, @PathVariable taskId: Int,
                      req: HttpServletRequest, res: HttpServletResponse): ResponseEntity[InputStreamResource] = {
    val f = new File("tmp")
    submissionService.writeSubmissionsOfTaskToFile(f, courseId, taskId)
    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(f.length())
      .header("Content-Disposition", s"attachment;filename=task_$taskId.zip")
      .body(new InputStreamResource(Files.newInputStream(f.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
  }
}
