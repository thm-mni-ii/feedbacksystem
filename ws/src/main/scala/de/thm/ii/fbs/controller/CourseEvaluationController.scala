package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.BadRequestException
import de.thm.ii.fbs.services.evaluation.FormulaService
import de.thm.ii.fbs.services.persistance.CourseRegistrationService
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
  private val courseRegistration: CourseRegistrationService = null
  @Autowired
  private val formulaService: FormulaService = null

  /**
    * Validate a evaluation formula
    *
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return List of courses
    */
  @GetMapping(value = Array("/evaluation/formula/validate"))
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
}
