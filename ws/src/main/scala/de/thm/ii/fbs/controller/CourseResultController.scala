package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseResult, CourseRole, GlobalRole, TaskResult}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, SubmissionService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

/**
  * Provides course submission results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"))
class CourseResultController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  /**
    * Returns the course results of all participants of a course.
    * @param cid Course id
    * @param req request
    * @param res response
    * @return A list of course results
    */
  @GetMapping(value = Array("/{cid}/results"))
  @ResponseBody
  def getAll(@PathVariable cid: Int, req: HttpServletRequest, res: HttpServletResponse): List[CourseResult] = {
    val user = authService.authorize(req, res)

    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (privilegedByCourse || user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR) {
      val participants = courseRegistration.getParticipants(cid)
      val tasks = taskService.getAll(cid)

      participants.map(participant => {
        val user = participant.user
        val results = tasks.map(task => {
          val submissions = submissionService.getAll(user.id, cid, task.id)
          val attempts = submissions.length
          val passed = submissions.exists(submission => submission.done && !submission.results.exists(_.exitCode != 0))
          TaskResult(task, attempts, passed)
        })
        val passed = results.forall(_.passed)
        CourseResult(user, passed, results)
      })
    } else {
      throw new ForbiddenException()
    }
  }
}
