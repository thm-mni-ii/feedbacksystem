package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, SQLCheckerQuery}
import de.thm.ii.fbs.services.persistence.{CourseRegistrationService, SQLCheckerService, TaskService}
import de.thm.ii.fbs.services.security.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, RequestMapping, ResponseBody, RestController}

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
  @GetMapping(value = Array("/{taskID}/queries"))
  @ResponseBody
  def getSubtaskStatistics(@PathVariable("taskID") taskID: Int, req: HttpServletRequest, res: HttpServletResponse): Seq[SQLCheckerQuery] = {
    val auth = authService.authorize(req, res)

    val task = taskService.getOne(taskID)

    val courseID = task match {
      case Some(task) => task.courseID
      case _ => throw new ForbiddenException()
    }

    val privilegedByCourse = courseRegistration.getParticipants(courseID).find(_.user.id == auth.id)
      .exists(p => p.role == CourseRole.DOCENT || p.role == CourseRole.TUTOR)
    val privileged = privilegedByCourse || auth.globalRole == GlobalRole.ADMIN || auth.globalRole == GlobalRole.MODERATOR

    if (!privileged) {
      throw new ForbiddenException()
    }

    sqlCheckerService.getQueriesForTask(taskID)
  }
}
