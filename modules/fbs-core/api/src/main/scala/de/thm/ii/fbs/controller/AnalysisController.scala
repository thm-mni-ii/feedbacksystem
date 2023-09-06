package de.thm.ii.fbs.controller

import de.thm.ii.fbs.model.AnalysisCourseResult
import de.thm.ii.fbs.services.persistence.CourseResultService
import de.thm.ii.fbs.utils.v2.security.authorization.IsModeratorOrCourseTutor
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Routes to query data for analysis purposes
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/analysis"))
class AnalysisController {
  @Autowired
  private val courseResultService: CourseResultService = null

  /**
    * Get anonymized results of a course from an task.
    *
    * @param courseId Course id
    * @param taskId      Task id
    * @param req      request
    * @param res      response
    * @return A list of course results
    */
  @GetMapping(value = Array("/courses/{courseId}/results/{taskId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getCourseResultsByTask(@PathVariable courseId: Int, @PathVariable taskId: Int, req: HttpServletRequest, res: HttpServletResponse)
  : List[AnalysisCourseResult] =
    courseResultService.getAllByTask(courseId, taskId)
}
