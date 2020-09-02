package de.thm.ii.fbs.controller

import java.nio.file.Files

import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.Submission
import de.thm.ii.fbs.services.TaskService
import de.thm.ii.fbs.services.core.TaskService
import de.thm.ii.fbs.services.persistance.{StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

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
             req: HttpServletRequest, res: HttpServletResponse): List[Submission] = ??? // TODO: Here

  /**
    * Submit a file for a task
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @param req Http request
    * @param res Http response
    * @param file Content: file to submit
    * @return Submission information
    */
  @PostMapping(value = Array("/{uid}/courses/{cid}/tasks/{tid}/submissions"),
  consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def submit(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,
             req: HttpServletRequest, res: HttpServletResponse, @RequestBody file: MultipartFile): Submission = {
    val user = authService.authorize(req, res)
    val allowed = user.id == uid

    if (allowed) {
      this.taskService.getOne(tid) match {
        case Some(task) =>
          val expectedMediaType = task.mediaType
          val currentMediaType = req.getContentType // Transform to media type (Content Type != Media Type)
          if (true) { // TODO: Check media type compatibility
            val tempDesc = Files.createTempFile("fbs", ".tmp")
            file.transferTo(tempDesc)
            val submission = submissionService.register(uid, tid)
            storageService.storeSolutionFile(submission.id, tempDesc)
            // TODO: Notify checker handler about new submission
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
      // TODO: Notify checker handler about new submission
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get a list of all submissions for a task
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
  def getOne(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("tid") tid: Int,  @PathVariable("sid") sid: Int,
             req: HttpServletRequest, res: HttpServletResponse): Submission = ??? // TODO: Here
}
