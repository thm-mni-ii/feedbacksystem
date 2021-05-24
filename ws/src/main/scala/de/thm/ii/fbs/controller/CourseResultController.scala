package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{EvaluationUserResult, CourseResult, CourseRole, GlobalRole, TaskResult}
import de.thm.ii.fbs.services.evaluation.EvaluationResultService
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, CourseResultService, EvaluationContainerService}
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
  private val courseResultService: CourseResultService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null
  @Autowired
  private val evaluationResultService: EvaluationResultService = null
  @Autowired
  private val evaluationContainerService: EvaluationContainerService = null

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
      courseResultService.getAll(cid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Returns the course evaluation results of all participants of a course.
    * @param cid Course id
    * @param req request
    * @param res response
    * @return A list of course results
    */
  @GetMapping(value = Array("/{cid}/evaluation/results"))
  @ResponseBody
  def getAllEvaluation(@PathVariable cid: Int, req: HttpServletRequest, res: HttpServletResponse): List[EvaluationUserResult] = {
    val user = authService.authorize(req, res)

    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.user.id == user.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)

    if (privilegedByCourse || user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR) {
      evaluationResultService.evaluate(evaluationContainerService.getAll(cid), courseResultService.getAll(cid))
    } else {
      throw new ForbiddenException()
    }
  }
}
