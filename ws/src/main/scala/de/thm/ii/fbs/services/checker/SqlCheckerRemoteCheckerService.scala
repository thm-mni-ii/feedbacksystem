package de.thm.ii.fbs.services.checker
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SqlCheckerInformation, Submission, Task}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceFormatSubmission, CheckerServiceOnChange}
import de.thm.ii.fbs.services.persistence.{SQLCheckerService, SubmissionService, TaskService, UserService}
import de.thm.ii.fbs.services.security.TokenService
import org.apache.http.client.utils.URIBuilder
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

object SqlCheckerRemoteCheckerService {
  private val isCheckerRun = new ConcurrentHashMap[Int, Boolean]()
}

@Service
class SqlCheckerRemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends RemoteCheckerService(insecure)
  with CheckerServiceFormatSubmission with CheckerServiceOnChange {
  @Autowired
  private val tokenService: TokenService = null
  @Autowired
  private val sqlCheckerService: SQLCheckerService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val userService: UserService = null
  @Value("${services.masterRunner.selfUrl}")
  private val selfUrl: String = null

  /**
    * Notify the runner about a new submission
    *
    * @param taskID       the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc           the CheckrunnerConfiguration to use
    * @param fu           the User model
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: model.User): Unit = {
    if (SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submissionID, false)) {
      val apiUrl = Some(new URIBuilder(selfUrl)
        .setPath(s"/api/v1/submissions/${submissionID}")
        .setParameter("typ", "sql-checker")
        .setParameter("token", tokenService.issue(s"submissions/$submissionID", 60))
        .build().toString
      )

      super.sendNotificationToRemote(taskID, submissionID, cc, fu, apiUrl = apiUrl)
    } else {
      super.notify(taskID, submissionID, cc.copy(checkerType = "sql"), fu)
    }
  }

  /**
    * Handles a result
    *
    * @param submission           The submission
    * @param checkerConfiguration The check runner configuration
    * @param task                 The task
    * @param exitCode             The exit Code of the runner
    * @param resultText           The resultText of the runner
    * @param extInfo              Extended runner information
    */
  override def handle(submission: Submission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                      resultText: String, extInfo: String): Unit = {
    if (SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submission.id, false)) {
      SqlCheckerRemoteCheckerService.isCheckerRun.remove(submission.id)
      this.handleSelf(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
    } else if (exitCode != 0 && hintsEnabled(checkerConfiguration)) {
      SqlCheckerRemoteCheckerService.isCheckerRun.put(submission.id, true)
      this.notify(task.id, submission.id, checkerConfiguration, userService.find(submission.userID.get).get)
    } else {
      super.handle(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
    }
  }

  private def handleSelf(submission: Submission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                         resultText: String, extInfo: String): Unit = {
    val userID = submission.userID.get
    val (exitCode, resultText) = checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) =>
        val hints = new StringBuilder()
        val attempts = submissionService.getAll(userID, task.courseID, task.id).length
        sqlCheckerService.getQuery(task.id, userID) match {
          case Some(query) =>
            if (!query.parsable) {
              hints ++= "query not parsable\n"
            } else {
              if (sci.showHints && sci.showHintsAt <= attempts) {
                if (!query.tablesRight.get) {
                  hints ++= "wrong tables used\n"
                }
                if (!query.att.get) {
                  hints ++= "wrong attributes used\n"
                }
                if (!query.whereAttributesRight.get) {
                  hints ++= "wrong where clause used\n"
                }
              }
              if (sci.showExtendedHints && sci.showExtendedHintsAt <= attempts) {
                //ToDo
              }
            }
            (if (query.queryRight) 0 else 1, hints.toString())
          case _ => (3, "sql-checker did not return query object")
        }
      case _ => (2, "invalid checker type information")
    }
    super.handle(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
  }

  def format(submission: Submission, checker: CheckrunnerConfiguration, solution: String): Any = {
    val task = taskService.getOne(checker.taskId).get
    val attempts = submissionService.getAll(submission.userID.get, task.courseID, checker.taskId).length
    new ObjectMapper().createObjectNode()
      .put("passed", false)
      .put("userId", submission.userID.get)
      .put("tid", checker.taskId)
      .put("sid", submission.id)
      .put("attempt", attempts)
      .put("submission", solution)
      .toString
  }

  override def onCheckerConfigurationChange(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) => sqlCheckerService.setSolution(UUID.randomUUID().toString, task.id, sci.solution)
      case _ =>
    }
  }

  private def hintsEnabled(checkerConfiguration: CheckrunnerConfiguration): Boolean =
    checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) => sci.showHints
      case _ => false
    }
}
