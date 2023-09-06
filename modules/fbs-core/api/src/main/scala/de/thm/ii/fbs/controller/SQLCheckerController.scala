package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import de.thm.ii.fbs.controller.exception.BadRequestException
import de.thm.ii.fbs.services.persistence.SQLCheckerService
import de.thm.ii.fbs.utils.v2.security.authorization.IsModeratorOrCourseTutorOfTask
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
  private val sqlCheckerService: SQLCheckerService = null

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskId}/queries/sumUpCorrect"))
  @ResponseBody
  @IsModeratorOrCourseTutorOfTask
  def sumUpCorrect(@PathVariable taskId: Int, @RequestParam returns: String,
                   req: HttpServletRequest, res: HttpServletResponse): ObjectNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => throw new BadRequestException("returns must be tables or attributes")
    }

    sqlCheckerService.sumUpCorrect(taskId, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskId}/queries/sumUpCorrectCombined"))
  @ResponseBody
  @IsModeratorOrCourseTutorOfTask
  def sumUpCorrectCombined(@PathVariable taskId: Int, @RequestParam returns: String,
                           req: HttpServletRequest, res: HttpServletResponse): ObjectNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => throw new BadRequestException("returns must be tables or attributes")
    }

    sqlCheckerService.sumUpCorrectCombined(taskId, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskId}/queries/listByType"))
  @ResponseBody
  @IsModeratorOrCourseTutorOfTask
  def listByType(@PathVariable taskId: Int, @RequestParam returns: String,
                 req: HttpServletRequest, res: HttpServletResponse): ArrayNode = {
    returns match {
      case "tables" | "attributes" => {}
      case _ => throw new BadRequestException("returns must be tables or attributes")
    }

    sqlCheckerService.listByType(taskId, returns)
  }

  /**
    * Get Queries
    */
  @GetMapping(value = Array("/{taskId}/queries/listByTypes"))
  @ResponseBody
  @IsModeratorOrCourseTutorOfTask
  def listByTypes(@PathVariable taskId: Int, @RequestParam tables: Boolean, @RequestParam attributes: Boolean,
                  req: HttpServletRequest, res: HttpServletResponse): ArrayNode =
    sqlCheckerService.listByTypes(taskId, tables, attributes)
}
