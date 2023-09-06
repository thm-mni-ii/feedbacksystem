package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.model.EvaluationContainer
import de.thm.ii.fbs.services.evaluation.FormulaService
import de.thm.ii.fbs.services.persistence.EvaluationContainerService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import de.thm.ii.fbs.utils.v2.security.authorization.{IsModeratorOrCourseTutor, IsUser}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * handle course evaluation
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class CourseEvaluationController {
  @Autowired
  private val formulaService: FormulaService = null
  @Autowired
  private val evaluationContainerService: EvaluationContainerService = null

  private def buildContainer(containerId: Integer, body: JsonNode): EvaluationContainer = {
    (body.retrive("toPass").asInt(), body.retrive("bonusFormula").asText(), body.retrive("hidePoints").asBool()) match {
      case (toPass, bonusFormula, hidePoints) => EvaluationContainer(containerId,
        toPass = toPass.getOrElse(0).asInstanceOf[Integer],
        bonusFormula = bonusFormula.orNull,
        hidePoints = hidePoints.getOrElse(false))
    }
  }

  /**
    * Validate a evaluation formula
    *
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return is the formula valid
    */
  @PostMapping(value = Array("/evaluation/formula/validate"))
  @ResponseBody
  @IsUser
  def validateFormula(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): JsonNode =
    body.retrive("formula").asText() match {
      case Some(formula) =>
        val valid = formulaService.validate(formula)
        res.setStatus(if (valid.result) 200 else 400)
        valid.toJson
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Get all Evaluation Container
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @return is the formula valid
    */
  @GetMapping(value = Array("/{courseId}/evaluation/container"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getAllContainer(@PathVariable courseId: Integer, req: HttpServletRequest, res: HttpServletResponse): List[EvaluationContainer] = {
    evaluationContainerService.getAll(courseId)
  }

  /**
    * Creating an evaluation container
    *
    * @param courseId Course id
    * @param req      http request
    * @param res      http response
    * @param body     contains JSON request
    * @return is the formula valid
    */
  @PostMapping(value = Array("/{courseId}/evaluation/container"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def createContainer(@PathVariable courseId: Integer,
                      req: HttpServletRequest, res: HttpServletResponse, @RequestBody(required = false) body: JsonNode): EvaluationContainer = {
    val container = buildContainer(-1, if (body == null) new ObjectMapper().createObjectNode() else body)
    printf(s"${container.hidePoints}, ${container.bonusFormula}, ${container.toPass}")
    evaluationContainerService.createContainer(courseId, container)
  }

  /**
    * Get an evaluation container
    *
    * @param courseId    Course id
    * @param containerId Container id
    * @param req         http request
    * @param res         http response
    * @return is the formula valid
    */
  @GetMapping(value = Array("/{courseId}/evaluation/container/{containerId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def getContainer(@PathVariable courseId: Integer, @PathVariable containerId: Integer, req: HttpServletRequest,
                   res: HttpServletResponse): EvaluationContainer = {
    evaluationContainerService.getOne(courseId, containerId) match {
      case Some(container) => container
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Updating an evaluation container
    *
    * @param courseId    Course id
    * @param containerId Container id
    * @param req         http request
    * @param res         http response
    * @param body        contains JSON request
    * @return is the formula valid
    */
  @PutMapping(value = Array("/{courseId}/evaluation/container/{containerId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def updateContainer(@PathVariable courseId: Integer, @PathVariable containerId: Integer, req: HttpServletRequest,
                      res: HttpServletResponse, @RequestBody body: JsonNode): EvaluationContainer = {
    val container = buildContainer(containerId, body)
    evaluationContainerService.updateContainer(courseId, containerId, container)
  }

  /**
    * Add an evaluation container task
    *
    * @param courseId    Course id
    * @param containerId Container id
    * @param taskId      Task id
    * @param req         http request
    * @param res         http response
    * @return is the formula valid
    */
  @PostMapping(value = Array("/{courseId}/evaluation/container/{containerId}/task/{taskId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def addTask(@PathVariable courseId: Integer, @PathVariable containerId: Integer, @PathVariable taskId: Integer, req: HttpServletRequest,
              res: HttpServletResponse): EvaluationContainer =
    evaluationContainerService.addTask(courseId, containerId, taskId)

  /**
    * Delete an evaluation container task
    *
    * @param courseId    Course id
    * @param containerId Container id
    * @param taskId      Task id
    * @param req         http request
    * @param res         http response
    * @return is the formula valid
    */
  @DeleteMapping(value = Array("/{courseId}/evaluation/container/{containerId}/task/{taskId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def deleteTask(@PathVariable courseId: Integer, @PathVariable containerId: Integer, @PathVariable taskId: Integer, req: HttpServletRequest,
                 res: HttpServletResponse): Unit =
    evaluationContainerService.removeTask(containerId, taskId)

  /**
    * Deleting an evaluation container
    *
    * @param courseId    Course id
    * @param containerId Container id
    * @param req         http request
    * @param res         http response
    * @return is the formula valid
    */
  @DeleteMapping(value = Array("/{courseId}/evaluation/container/{containerId}"))
  @ResponseBody
  @IsModeratorOrCourseTutor
  def deleteContainer(@PathVariable courseId: Integer, @PathVariable containerId: Integer, req: HttpServletRequest,
                      res: HttpServletResponse): Unit =
    evaluationContainerService.deleteContainer(courseId, containerId)
}
