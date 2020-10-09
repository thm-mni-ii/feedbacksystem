package de.thm.ii.fbs.controller

import java.io.FileOutputStream
import java.nio.file.Files

import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.Submission
import de.thm.ii.fbs.services.checker.RemoteCheckerService
import de.thm.ii.fbs.services.persistance.{CheckerConfigurationService, StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

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
  private val submissionService: SubmissionService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkerConfigurationService: CheckerConfigurationService = null
  @Autowired
  private val remoteCheckerService: RemoteCheckerService = null

  /**
    * Get a list of all submissions for a task
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

    if (user.id == uid) {
      submissionService.getAll(uid, cid, tid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Submit a file for a task
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @return Submission information
    */
  @PostMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions"))
  @ResponseBody
  def submit(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
             req: HttpServletRequest, res: HttpServletResponse): Submission = {
    val user = authService.authorize(req, res)

    if (user.id == uid) {
      this.taskService.getOne(tid) match {
        case Some(task) =>
          val expectedMediaType = task.mediaType
          val currentMediaType = req.getContentType // Transform to media type (Content Type != Media Type)
          if (true) { // TODO: Check media type compatibility
            val tempDesc = Files.createTempFile("fbs", ".tmp")
            req.getInputStream.transferTo(new FileOutputStream(tempDesc.toFile))
            val submission = submissionService.create(uid, tid)
            storageService.storeSolutionFile(submission.id, tempDesc)
            checkerConfigurationService.getAll(cid, tid).foreach(cc =>
              remoteCheckerService.notify(tid, submission.id, cc, user))
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
             req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val allowed = user.id == uid
    if (allowed) {
      submissionService.getOne(sid, uid) match {
        case Some(_) =>
          submissionService.clearResults(sid, uid)
          checkerConfigurationService.getAll(cid, tid).foreach(cc =>
            remoteCheckerService.notify(tid, sid, cc, user))
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get the status of submission
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

    if (user.id == uid) {
      submissionService.getOne(sid, uid) match {
        case Some(submission) => submission
        case None => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }
}
