package de.thm.ii.fbs.services.checker

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.checker.{RunnerRequest, SqlCheckerState, SqlCheckerSubmission, User}
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SQLCheckerQuery, SqlCheckerInformation, Submission => FBSSubmission}
import de.thm.ii.fbs.services.checker.`trait`._
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.security.TokenService
import org.apache.http.client.utils.URIBuilder
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.util.UUID
import java.util.Optional
import java.util.concurrent.ConcurrentHashMap
import scala.collection.mutable
import scala.jdk.CollectionConverters._

object SqlCheckerRemoteCheckerService {
  private val isCheckerRun = new ConcurrentHashMap[Int, SqlCheckerState.Value]()
  private val extInfo = new ConcurrentHashMap[Int, String]()
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
  private val checkerService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null
  @Value("${services.masterRunner.selfUrl}")
  private val selfUrl: String = null
  @Value("${spring.data.mongodb.uri}")
  private val mongodbUrl: String = null

  /**
    * Notify the runner about a new submission
    *
    * @param taskID       the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc           the CheckrunnerConfiguration to use
    * @param fu           the User model
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: model.User): Unit = {
    if (SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submissionID, SqlCheckerState.Runner) != SqlCheckerState.Runner) {
      val apiUrl = new URIBuilder(selfUrl)
        .setPath(s"/api/v1/checker/submissions/$submissionID")
        .setParameter("typ", "sql-checker")
        .setParameter("token", tokenService.issue(s"submissions/$submissionID", 60))
        .build().toString

      super.sendNotificationToRemote(taskID, SqlCheckerSubmission(submissionID, User(fu.id, fu.username), apiUrl, mongodbUrl), cc)
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
    SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submission.id, SqlCheckerState.Runner) match {
      case SqlCheckerState.Runner =>
        println("a")
        SqlCheckerRemoteCheckerService.isCheckerRun.put(submission.id, SqlCheckerState.Checker)
        this.notify(task.id, submission.id, checkerConfiguration, userService.find(submission.userID.get).get)
        if (exitCode == 2 && hintsEnabled(checkerConfiguration)) {
          println("b")
          if (extInfo != null) {
            println("c")
            SqlCheckerRemoteCheckerService.extInfo.put(submission.id, extInfo)
          }
        } else {
          SqlCheckerRemoteCheckerService.isCheckerRun.put(submission.id, SqlCheckerState.Ignore)
          super.handle(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
        }
      case SqlCheckerState.Checker =>
        println("e")
        SqlCheckerRemoteCheckerService.isCheckerRun.remove(submission.id)
        val extInfo = SqlCheckerRemoteCheckerService.extInfo.remove(submission.id)
        this.handleSelf(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
      case SqlCheckerState.Ignore =>
        println("f")
        SqlCheckerRemoteCheckerService.isCheckerRun.remove(submission.id)
    }
  }

  private def handleSelf(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                         resultText: String, extInfo: String): Unit = {
    val userID = submission.userID.get
    val (exitCode, resultText) = checkerConfiguration.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) =>
        val hints = new mutable.StringBuilder()
        val attempts = submissionService.getAll(userID, task.courseID, task.id).length
        sqlCheckerService.getQuery(submission.id) match {
          case Some(query) =>
            if (!query.parsable) {
              hints ++= "genaues Feedback nicht verfügbar\n"
            } else {
              formatHint(sci, hints, attempts, query)
            }
            (if (Optional.ofNullable(query.queryRight)
              .or(() => Optional.ofNullable(query.passed)).flatMap(a => a).get()) {0} else {1}, hints.toString())
          case _ => (3, "sql-checker hat kein Abfrageobjekt zurückgegeben")
        }
      case _ => (2, "Ungültige Checker-Typ-Informationen")
    }
    super.handle(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
  }

  private def formatHint(sci: SqlCheckerInformation, hints: StringBuilder, attempts: Int, query: SQLCheckerQuery): Unit = {
    if (sci.showHints && sci.showHintsAt <= attempts) {
      if (query.version == Optional.of("v2")) {
        formatV2(hints, query)
      } else {
        formatLegacy(hints, query)
      }
    }
    if (query.distance.isPresent) {
      hints ++= "Distanz zur nächstens Musterlösung: "
      hints ++= query.distance.get.toString
      hints ++= "\n"
    }
    if (sci.showExtendedHints && sci.showExtendedHintsAt <= attempts) {
      //ToDo
    }
  }

  private def formatV2(hints: StringBuilder, query: SQLCheckerQuery): Unit = {
    for (error <- query.errors.asScala) {
      hints ++= "In "
      hints ++= error.trace.asScala.mkString(", ")
      hints ++= " expected "
      hints ++= error.expected
      hints ++= " but got "
      hints ++= error.got
      hints ++= "\n\n"
    }
  }

  private def formatLegacy(hints: StringBuilder, query: SQLCheckerQuery): Unit = {
    if (!query.tablesRight.get) {
      hints ++= "falsche Tabellen verwendet\n"
    }
    if (!query.selAttributesRight.get) {
      hints ++= "falsche Where-Attribute verwendet\n"
    }
    if (!query.proAttributesRight.get) {
      hints ++= "falsche Select-Attribute verwendet\n"
    }
    if (!query.stringsRight.get) {
      if (!query.wildcards.get) {
        hints ++= "falsche Zeichenketten verwendet, bitte auch die Wildcards prüfen\n"
      } else {
        hints ++= "falsche Zeichenketten verwendet\n"
      }
    }
    if (!query.orderByRight.get) {
      hints ++= "falsche Order By verwendet\n"
    }
    if (!query.groupByRight.get) {
      hints ++= "falsche Group By verwendet\n"
    }
    if (!query.joinsRight.get) {
      hints ++= "falsche Joins verwendet\n"
    }
  }

  def formatSubmission(submission: FBSSubmission, checker: CheckrunnerConfiguration, solution: String): Any = {
    val task = taskService.getOne(checker.taskId).get
    val attempts = submissionService.getAll(submission.userID.get, task.courseID, checker.taskId).length
    val passed = submission.results.headOption.exists(result => result.exitCode == 0)
    new ObjectMapper().createObjectNode()
      .put("passed", passed)
      .put("isSol", false)
      .put("userId", submission.userID.get)
      .put("cid", task.courseID)
      .put("tid", checker.taskId)
      .put("sid", submission.id)
      .put("attempt", attempts)
      .put("submission", solution)
      .toString
  }

  def formatConfiguration(checker: CheckrunnerConfiguration): Any = {
    val task = taskService.getOne(checker.taskId).get
    checker.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) =>
        new ObjectMapper().createObjectNode()
          .put("passed", true)
          .put("isSol", true)
          .put("resultText", "OK")
          .put("userId", 0)
          .put("cid", task.courseID)
          .put("tid", checker.taskId)
          .put("sid", UUID.randomUUID().toString)
          .put("attempt", 1)
          .put("submission", sci.solution)
          .toString
      case _ => new ObjectMapper().createObjectNode().toString
    }
  }

  override def onCheckerConfigurationChange(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    checkerConfiguration.checkerTypeInformation match {
      case Some(_: SqlCheckerInformation) =>
        sqlCheckerService.deleteSolutions(task.id)

        val apiUrl = new URIBuilder(selfUrl)
          .setPath(s"/api/v1/checker/checkers/${checkerConfiguration.id}")
          .setParameter("typ", "sql-checker")
          .setParameter("token", tokenService.issue(s"checkers/${checkerConfiguration.id}", 60))
          .build().toString

        val request = RunnerRequest(task.id, generateRunnerConfiguration(checkerConfiguration), SqlCheckerSubmission(0, User(0, ""), apiUrl, mongodbUrl))
        restTemplate.postForEntity(masterRunnerURL + "/runner/start", request.toJson, classOf[Unit])
      case _ =>
    }
  }

  override def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    val content = storageService.getMainFileContent(checkerConfiguration)
    val json = new ObjectMapper().readValue(content, classOf[JsonNode])
    Option(json.get("sections").get(0).get("query")).map(query => query.asText()) match {
      case Some(query: String) => checkerConfiguration.checkerTypeInformation match {
        case Some(sqlCheckerInformation: SqlCheckerInformation) => {
          val ci = sqlCheckerInformation.copy(solution = query)
          checkerService.setCheckerTypeInformation(cid, checkerConfiguration.taskId, checkerConfiguration.id,
            Some(ci))
          onCheckerConfigurationChange(task, checkerConfiguration.copy(checkerTypeInformation = Some(ci)))
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
