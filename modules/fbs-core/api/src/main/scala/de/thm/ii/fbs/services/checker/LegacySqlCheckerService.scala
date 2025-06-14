package de.thm.ii.fbs.services.checker
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.checker.{RunnerRequest, SqlCheckerSubmission, User}
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SQLCheckerQuery, SqlCheckerInformation, Submission => FBSSubmission}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceFormatConfiguration, CheckerServiceFormatSubmission,
  CheckerServiceOnChange, CheckerServiceOnDelete, CheckerServiceOnMainFileUpload}
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, SQLCheckerService, SubmissionService, TaskService, UserService}
import de.thm.ii.fbs.services.security.TokenService
import org.apache.http.client.utils.URIBuilder
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.util.{Optional, UUID}
import scala.collection.mutable
import scala.jdk.CollectionConverters._

@Service
class LegacySqlCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends SqlCheckerRemoteCheckerService(insecure)
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
  private val checkerService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  @Value("${services.masterRunner.selfUrl}")
  private val selfUrl: String = null
  @Value("${spring.data.mongodb.uri}")
  private val mongodbUrl: String = null

  override def notifyChecker(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: model.User): Unit = {
    val apiUrl = new URIBuilder(selfUrl)
      .setPath(s"/api/v1/checker/submissions/$submissionID")
      .setParameter("typ", "sql-checker")
      .setParameter("token", tokenService.issue(s"submissions/$submissionID", 60))
      .build().toString

    super.sendNotificationToRemote(taskID, SqlCheckerSubmission(submissionID, User(fu.id, fu.username), apiUrl, mongodbUrl), cc)
  }

  override def handleChecker(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
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
    storeResult(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
  }

  def formatSubmission(submission: FBSSubmission, checker: CheckrunnerConfiguration, solution: String): Any = {
    val task = taskService.getOne(checker.taskId).get
    val attempts = submissionService.getAll(submission.userID.get, task.courseID, checker.taskId).length
    val passed = submission.results.headOption.exists(result => result.exitCode == 0)
    new ObjectMapper().createObjectNode()
      .put("passed", passed)
      .put("isSol", !checker.checkerTypeInformation.get.asInstanceOf[SqlCheckerInformation].disableDistance)
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

  private def formatHint(sci: SqlCheckerInformation, hints: StringBuilder, attempts: Int, query: SQLCheckerQuery): Unit = {
    if (sci.showHints && sci.showHintsAt <= attempts) {
      if (query.version == Optional.of("v2")) {
        formatV2(hints, query)
      } else {
        formatLegacy(hints, query)
      }
    }
    if (!sci.disableDistance && query.distance.isPresent) {
      val steps = Math.round(query.distance.get / 50)
      if (steps == 0) {
        hints ++= "Du bist ganz nah an der Lösung, es sind nur noch kleine Änderung notwendig.\n"
      } else {
        hints ++= "Es sind "
        hints ++= steps.toString
        hints ++= " Änderungen erforderlich, um Deine Lösung an die nächstgelegene Musterlösung anzupassen.\n"
      }
    }
    if (sci.showExtendedHints && sci.showExtendedHintsAt <= attempts) {
      //ToDo
    }
  }

  private def formatV2(hints: StringBuilder, query: SQLCheckerQuery): Unit = {
    for (error <- query.errors.asScala) {
      hints ++= "Mistake in "
      hints ++= error.trace.asScala.mkString(", ")
      hints ++= " where "
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
}
