package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException}
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, SQLCheckerQuery}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, SQLCheckerService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, RequestMapping, RequestParam, ResponseBody, RestController}

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Controller for SQL-Checker Mongodb Interface
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/sqlChecker"))
class SQLCheckerController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val sqlCheckerService: SQLCheckerService = null

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskID}/queries/sumUpCorrect"))
  @ResponseBody
  def sumUpCorrect(@PathVariable("taskID") taskID: Int, @RequestParam returns: String, req: HttpServletRequest, res: HttpServletResponse): ObjectNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => {
        throw new BadRequestException("returns must be tables or attributes")
      }
    }

    this.authorize(taskID, req, res)

    sqlCheckerService.sumUpCorrect(taskID, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskID}/queries/sumUpCorrectCombined"))
  @ResponseBody
  def sumUpCorrectCombined(@PathVariable("taskID") taskID: Int, @RequestParam returns: String,
                           req: HttpServletRequest, res: HttpServletResponse): ObjectNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => {
        throw new BadRequestException("returns must be tables or attributes")
      }
    }

    this.authorize(taskID, req, res)

    sqlCheckerService.sumUpCorrectCombined(taskID, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskID}/queries/listByType"))
  @ResponseBody
  def listByType(@PathVariable("taskID") taskID: Int, @RequestParam returns: String, req: HttpServletRequest, res: HttpServletResponse): ArrayNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => {
        throw new BadRequestException("returns must be tables or attributes")
      }
    }

    this.authorize(taskID, req, res)

    sqlCheckerService.listByType(taskID, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskID}/queries/listByTypes"))
  @ResponseBody
  def listByTypes(@PathVariable("taskID") taskID: Int, @RequestParam tables: Boolean, @RequestParam attributes: Boolean,
                  req: HttpServletRequest, res: HttpServletResponse): ArrayNode = {
    this.authorize(taskID, req, res)

    sqlCheckerService.listByTypes(taskID, tables, attributes)
  }

  private def authorize(taskID: Int, req: HttpServletRequest, res: HttpServletResponse) = {
    val auth = authService.authorize(req, res)

    val task = taskService.getOne(taskID)

    val privilegedByCourse = task match {
      case Some(task) => courseRegistration.getParticipants(task.courseID).find(_.user.id == auth.id)
        .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)
      case _ => false
    }

    val privileged = privilegedByCourse || auth.globalRole == GlobalRole.ADMIN || auth.globalRole == GlobalRole.MODERATOR

    if (!privileged) {
      throw new ForbiddenException()
    }
  }
}
