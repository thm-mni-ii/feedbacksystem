package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{CourseRole, EvaluationContainer, GlobalRole}
import de.thm.ii.fbs.services.evaluation.FormulaService
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, EvaluationContainerService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
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
  private val authService: AuthService = null
  @Autowired
  private val formulaService: FormulaService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val evaluationContainerService: EvaluationContainerService = null

  private def isAuthorized(cid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val privileged = (user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
      || List(CourseRole.DOCENT, CourseRole.TUTOR).contains(courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)))

    if (!privileged) throw new ForbiddenException()
  }

  private def buildContainer(ctid: Integer, body: JsonNode): EvaluationContainer = {
    (body.retrive("toPass").asInt(), body.retrive("bonusFormula").asText(), body.retrive("hidePoints").asBool()) match {
      case (toPass, bonusFormula, hidePoints) => EvaluationContainer(ctid,
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
  def validateFormula(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): JsonNode = {
    authService.authorize(req, res)

    body.retrive("formula").asText() match {
      case Some(formula) =>
        val valid = formulaService.validate(formula)
        res.setStatus(if (valid.result) 200 else 400)
        valid.toJson
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Get all Evaluation Container
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return an array of all container
    */
  @GetMapping(value = Array("/{cid}/evaluation/container"))
  @ResponseBody
  def getAllContainer(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): List[EvaluationContainer] = {
    isAuthorized(cid, req, res)
    evaluationContainerService.getAll(cid)
  }

  /**
    * Creating an evaluation container
    *
    * @param cid  Course id
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return is the formula valid
    */
  @PostMapping(value = Array("/{cid}/evaluation/container"))
  @ResponseBody
  def createContainer(@PathVariable("cid") cid: Integer,
                      req: HttpServletRequest, res: HttpServletResponse, @RequestBody(required = false) body: JsonNode): EvaluationContainer = {
    isAuthorized(cid, req, res)

    val container = buildContainer(-1, if (body == null) new ObjectMapper().createObjectNode() else body)
    printf(s"${container.hidePoints}, ${container.bonusFormula}, ${container.toPass}")
    evaluationContainerService.createContainer(cid, container)
  }

  /**
    * Get an evaluation container
    *
    * @param cid  Course id
    * @param ctid Container id
    * @param req  http request
    * @param res  http response
    * @return is the formula valid
    */
  @GetMapping(value = Array("/{cid}/evaluation/container/{ctid}"))
  @ResponseBody
  def getContainer(@PathVariable("cid") cid: Integer, @PathVariable("ctid") ctid: Integer, req: HttpServletRequest,
                   res: HttpServletResponse): EvaluationContainer = {
    isAuthorized(cid, req, res)
    evaluationContainerService.getOne(cid, ctid) match {
      case Some(container) => container
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Updating an evaluation container
    *
    * @param cid  Course id
    * @param ctid Container id
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return is the formula valid
    */
  @PutMapping(value = Array("/{cid}/evaluation/container/{ctid}"))
  @ResponseBody
  def updateContainer(@PathVariable("cid") cid: Integer, @PathVariable("ctid") ctid: Integer, req: HttpServletRequest,
                      res: HttpServletResponse, @RequestBody body: JsonNode): EvaluationContainer = {
    isAuthorized(cid, req, res)

    val container = buildContainer(ctid, body)
    evaluationContainerService.updateContainer(cid, ctid, container)
  }

  /**
    * Add an evaluation container task
    *
    * @param cid  Course id
    * @param ctid Container id
    * @param tid Task id
    * @param req  http request
    * @param res  http response
    * @return is the formula valid
    */
  @PostMapping(value = Array("/{cid}/evaluation/container/{ctid}/task/{tid}"))
  @ResponseBody
  def addTask(@PathVariable("cid") cid: Integer, @PathVariable("ctid") ctid: Integer, @PathVariable("tid") tid: Integer, req: HttpServletRequest,
                      res: HttpServletResponse): EvaluationContainer = {
    isAuthorized(cid, req, res)
    evaluationContainerService.addTask(cid, ctid, tid)
  }

  /**
    * Delete an evaluation container task
    *
    * @param cid  Course id
    * @param ctid Container id
    * @param tid Task id
    * @param req  http request
    * @param res  http response
    * @return is the formula valid
    */
  @DeleteMapping(value = Array("/{cid}/evaluation/container/{ctid}/task/{tid}"))
  @ResponseBody
  def deleteTask(@PathVariable("cid") cid: Integer, @PathVariable("ctid") ctid: Integer, @PathVariable("tid") tid: Integer, req: HttpServletRequest,
              res: HttpServletResponse): Unit = {
    isAuthorized(cid, req, res)
    evaluationContainerService.removeTask(ctid, tid)
  }

  /**
    * Deleting an evaluation container
    *
    * @param cid  Course id
    * @param ctid Container id
    * @param req  http request
    * @param res  http response
    * @return is the formula valid
    */
  @DeleteMapping(value = Array("/{cid}/evaluation/container/{ctid}"))
  @ResponseBody
  def deleteContainer(@PathVariable("cid") cid: Integer, @PathVariable("ctid") ctid: Integer, req: HttpServletRequest,
                      res: HttpServletResponse): Unit = {
    isAuthorized(cid, req, res)
    evaluationContainerService.deleteContainer(cid, ctid)
  }
}
