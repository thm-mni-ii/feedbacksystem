package de.thm.ii.fbs.services.checker
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission, Task}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceFormatSubmission, CheckerServiceOnChange}
import de.thm.ii.fbs.services.persistence.SQLCheckerService
import de.thm.ii.fbs.services.security.TokenService
import org.apache.http.client.utils.URIBuilder
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.util.UUID

@Service
class SqlCheckerRemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends RemoteCheckerService(insecure)
  with CheckerServiceFormatSubmission with CheckerServiceOnChange {
  @Autowired
  private val tokenService: TokenService = null
  @Autowired
  private val sqlCheckerService: SQLCheckerService = null
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
    val apiUrl = Some(new URIBuilder(selfUrl)
      .setPath(s"/api/v1/submissions/${submissionID}")
      .setParameter("typ", "sql-checker")
      .setParameter("token", tokenService.issue(s"submissions/$submissionID", 60))
      .build().toString
    )

    super.sendNotificationToRemote(taskID, submissionID, cc, fu, apiUrl = apiUrl)
  }

  /**
    * Handles a result
    *
    * @param sid        The submission id
    * @param ccid       The check runner configuration id
    * @param exitCode   The exit Code of the runner
    * @param resultText The resultText of the runner
    * @param extInfo    Extended runner information
    */
  override def handle(sid: Int, ccid: Int, exitCode: Int, resultText: String, extInfo: String): Unit = {
    super.handle(sid, ccid, exitCode, "", extInfo)
  }

  def format(submission: Submission, checker: CheckrunnerConfiguration, solution: String): Any = {
    new ObjectMapper().createObjectNode()
      .put("passed", false)
      .put("userid", submission.userID.get)
      .put("attempt", 0)
      .put("submission", solution)
      .toString
  }

  override def onCheckerConfigurationChange(task: Task, checkerConfiguration: CheckrunnerConfiguration,
                                            mainFile: String, secondaryFile: String): Unit = {
    sqlCheckerService.createSolution(UUID.randomUUID().toString, task.id, secondaryFile)
  }
}
