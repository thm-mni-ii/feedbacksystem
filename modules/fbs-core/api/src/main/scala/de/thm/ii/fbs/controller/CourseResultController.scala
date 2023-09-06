package de.thm.ii.fbs.controller

import de.thm.ii.fbs.model.{CourseResult, EvaluationUserResult}
import de.thm.ii.fbs.services.evaluation.EvaluationResultService
import de.thm.ii.fbs.services.persistence.{CourseResultService, EvaluationContainerService}
import de.thm.ii.fbs.utils.v2.security.authorization.IsModeratorOrCourseTutor
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Provides course submission results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"))
class CourseResultController {
  @Autowired
  private val courseResultService: CourseResultService = null
  @Autowired
  private val evaluationResultService: EvaluationResultService = null
  @Autowired
  private val evaluationContainerService: EvaluationContainerService = null

  /**
    * Returns the course results of all participants of a course.
    *
    * @param courseId Course id
    * @param req      request
    * @param res      response
    * @return A list of course results
    */
  @GetMapping(value = Array("/{courseId}/results"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getAll(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): List[CourseResult] =
    courseResultService.getAll(courseId)

  /**
    * Returns the course evaluation results of all participants of a course.
    *
    * @param courseId Course id
    * @param req      request
    * @param res      response
    * @return A list of course results
    */
  @GetMapping(value = Array("/{courseId}/evaluation/results"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getAllEvaluation(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): List[EvaluationUserResult] =
    evaluationResultService.evaluate(evaluationContainerService.getAll(courseId), courseResultService.getAll(courseId))

  /**
    * Returns the course results exlude tutor and docent.
    *
    * @param courseId Course id
    * @param req      request
    * @param res      response
    * @return A list of course results
    */
  @GetMapping(value = Array("/{courseId}/results/student"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getStudentResult(@PathVariable courseId: Int, req: HttpServletRequest, res: HttpServletResponse): List[CourseResult] =
    courseResultService.getAll(courseId, 2, 2)
}
