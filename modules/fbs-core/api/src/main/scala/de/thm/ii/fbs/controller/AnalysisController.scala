package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.model.AnalysisCourseResult
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, CourseResultService, EvaluationContainerService}
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, RequestMapping, ResponseBody, RestController}

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Routes to query data for analysis purposes
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/analysis"))
class AnalysisController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val courseResultService: CourseResultService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null

  /**
    * Get anonymised results of a course from an task.
    * @param cid Course id
    * @param tid Task id
    * @param req request
    * @param res response
    * @return A list of course results
    */
  @GetMapping(value = Array("/courses/{cid}/results/{tid}"))
  @ResponseBody
  def getCourseResultsByTask(@PathVariable cid: Int, @PathVariable tid: Int, req: HttpServletRequest, res: HttpServletResponse): List[AnalysisCourseResult] = {
    val user = authService.authorize(req, res)

    val privilegedByCourse = courseRegistration.getParticipants(cid).find(_.getUser.getId == user.getId)
      .exists(p => p.getRole == CourseRole.DOCENT || p.getRole == CourseRole.TUTOR)

    if (privilegedByCourse || user.getGlobalRole == GlobalRole.ADMIN || user.getGlobalRole == GlobalRole.MODERATOR) {
      courseResultService.getAllByTask(cid, tid)
    } else {
      throw new ForbiddenException()
    }
  }
}
