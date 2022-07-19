package de.thm.ii.fbs.services.checker
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.{CheckerTypeInformation, CheckrunnerConfiguration, SqlCheckerInformation, Task, Submission => FBSSubmission}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceFormatConfiguration, CheckerServiceFormatSubmission,
  CheckerServiceOnChange, CheckerServiceOnDelete, CheckerServiceOnMainFileUpload}
import de.thm.ii.fbs.services.persistence.{CheckerConfigurationService, SQLCheckerService, SubmissionService, TaskService, UserService}
import de.thm.ii.fbs.services.security.TokenService
import org.apache.http.client.utils.URIBuilder
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.nio.file.{Files, Path}
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import scala.collection.mutable

object SqlCheckerRemoteCheckerService {
  private val isCheckerRun = new ConcurrentHashMap[Int, Boolean]()
}

@Service
class SqlCheckerRemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends RemoteCheckerService(insecure)
  with CheckerServiceFormatSubmission with CheckerServiceFormatConfiguration with CheckerServiceOnChange with CheckerServiceOnDelete
  with CheckerServiceOnMainFileUpload {
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
  @Autowired
  private val checkerService: CheckerConfigurationService = null
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
        .setPath(s"/api/v1/checker/submissions/${submissionID}")
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
  override def handle(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
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

  private def handleSelf(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                         resultText: String, extInfo: String): Unit = {
    val userID = submission.userID.get
    val (exitCode, resultText) = checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) =>
        val hints = new mutable.StringBuilder()
        val attempts = submissionService.getAll(userID, task.courseID, task.id).length
        sqlCheckerService.getQuery(task.id, userID) match {
          case Some(query) =>
            if (!query.parsable) {
              hints ++= "Abfrage nicht parsbar\n"
            } else {
              if (sci.showHints && sci.showHintsAt <= attempts) {
                if (!query.tablesRight.get) {
                  hints ++= "falsche Tabellen verwendet\n"
                }
                if (!query.selAttributesRight.get) {
                  hints ++= "falsche Select-Attribute verwendet\n"
                }
                if (!query.proAttributesRight.get) {
                  hints ++= "falsche Where-Attribute verwendet\n"
                }
                if (!query.stringsRight.get) {
                  hints ++= "falsche Zeichenketten verwendet\n"
                }
              }
              if (sci.showExtendedHints && sci.showExtendedHintsAt <= attempts) {
                //ToDo
              }
            }
            (if (query.queryRight) 0 else 1, hints.toString())
          case _ => (3, "sql-checker hat kein Abfrageobjekt zurückgegeben")
        }
      case _ => (2, "Ungültige Checker-Typ-Informationen")
    }
    super.handle(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
  }

  def formatSubmission(submission: FBSSubmission, checker: CheckrunnerConfiguration, solution: String): Any = {
    val task = taskService.getOne(checker.taskId).get
    val attempts = submissionService.getAll(submission.userID.get, task.courseID, checker.taskId).length
    new ObjectMapper().createObjectNode()
      .put("passed", false)
      .put("isSol", false)
      .put("userId", submission.userID.get)
      .put("tid", checker.taskId)
      .put("sid", submission.id)
      .put("attempt", attempts)
      .put("submission", solution)
      .toString
  }

  def formatConfiguration(checker: CheckrunnerConfiguration): Any = {
    checker.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) => {
        new ObjectMapper().createObjectNode()
          .put("passed", true)
          .put("isSol", true)
          .put("resultText", "OK")
          .put("userId", 0)
          .put("tid", checker.taskId)
          .put("sid", UUID.randomUUID().toString)
          .put("attempt", 1)
          .put("submission", sci.solution)
          .toString
      }
      case _ => new ObjectMapper().createObjectNode().toString
    }
  }

  override def onCheckerConfigurationChange(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    checkerConfiguration.checkerTypeInformation match {
      case Some(_: SqlCheckerInformation) =>
        sqlCheckerService.deleteSolutions(task.id)

        val apiUrl = Some(new URIBuilder(selfUrl)
          .setPath(s"/api/v1/checker/checkers/${checkerConfiguration.id}")
          .setParameter("typ", "sql-checker")
          .setParameter("token", tokenService.issue(s"checkers/${checkerConfiguration.id}", 60))
          .build().toString
        )

        val request = RunnerRequest(task.id, rcFromCC(checkerConfiguration), Submission(0, User(0, ""), "", "", apiUrl = apiUrl))
        restTemplate.postForEntity(masterRunnerURL + "/runner/start", request.toJson, classOf[Unit])
      case _ =>
    }
  }

  override def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration, mainFile: Path): Unit = {
    val content = Files.readString(mainFile)
    val json = new ObjectMapper().readValue(content, classOf[JsonNode])
    Option(json.get("sections").get(0).get("query")).map(query => query.asText()) match {
      case Some(query: String) => checkerConfiguration.checkerTypeInformation match {
        case Some(sqlCheckerInformation: SqlCheckerInformation) => {
          val newCC = checkerConfiguration.copy(checkerTypeInformation = Some(sqlCheckerInformation.copy(solution = query)))
          checkerService.update(cid, newCC.taskId, newCC.id, newCC)
          onCheckerConfigurationChange(task, checkerConfiguration)
        }
        case _ =>
      }
      case _ =>
    }
  }

  override def onCheckerConfigurationDelete(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    checkerConfiguration.checkerTypeInformation match {
      case Some(_: SqlCheckerInformation) =>
        sqlCheckerService.deleteSolutions(task.id)
      case _ =>
    }
  }

  private def hintsEnabled(checkerConfiguration: CheckrunnerConfiguration): Boolean =
    checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) => sci.showHints
      case _ => false
    }
}
