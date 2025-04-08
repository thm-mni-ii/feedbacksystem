package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.checker.assa
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SqlCheckerInformation, Submission, User}
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService
import de.thm.ii.fbs.services.persistence.{SubmissionService, TaskService}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.{HttpHeaders, HttpMethod, MediaType, RequestEntity}
import org.springframework.stereotype.Service

import java.net.URI

@Service
class AiSupportedSqlAnalysisService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends SqlCheckerRemoteCheckerService(insecure) {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null

  @Value("${services.assa.url}")
  private val url: String = null
  @Value("${services.assa.token}")
  private val token: String = null

  override protected def notifyChecker(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val schema = minioStorageService.getSecondaryFileFromBucket(cc.id)
    val submission = minioStorageService.getSolutionFileFromBucket(submissionID);
    val solution = cc.checkerTypeInformation match {
      case Some(sci: SqlCheckerInformation) => sci.solution
      case _ => throw new RuntimeException("invalid checker information")
    }
    val task_description = taskService.getOne(taskID).map(t => t.description).getOrElse("")

    val headers = new HttpHeaders()
    headers.setBearerAuth(token)
    headers.setContentType(MediaType.APPLICATION_JSON)
    val request = new RequestEntity[String](assa.Request(
      sqlEnvironment = "postgres",
      dbSchema = schema,
      task = task_description,
      solutions = List(solution),
      submissions = List(submission),
      taskId = Some(taskID.toString),
      userId = Some(fu.id.toString),
    ).toJson.toString, headers, HttpMethod.POST, new URI(url))

    val responseEntity = this.restTemplate.exchange(
      request,
      Class.forName("java.lang.String"),
    )
    val response = assa.Response.fromJsonList(responseEntity.getBody.toString).head

    submissionService.storeResult(submissionID, cc.id, 1, response.feedback, null)
  }

  override protected def handleChecker(submission: Submission, checkerConfiguration: CheckrunnerConfiguration,
                                       task: Task, exitCode: Int, resultText: String, extInfo: String): Unit = {}
}
