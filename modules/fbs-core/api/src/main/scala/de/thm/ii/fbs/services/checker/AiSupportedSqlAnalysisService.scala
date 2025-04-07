package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SqlCheckerInformation, Submission, User}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import de.thm.ii.fbs.model.checker.assa
import de.thm.ii.fbs.services.persistence.{SubmissionService, TaskService}
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService;

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

    val respone = this.restTemplate.postForObject(
      url,
      assa.Request(
        sqlEnvironment = "postgres",
        dbSchema = schema,
        task = task_description,
        solutions = List(solution),
        submissions = List(submission),
        taskId = Some(taskID.toString),
        userId = Some(fu.id.toString),
      ),
      assa.Response.getClass
    ).asInstanceOf[assa.Response]

    submissionService.storeResult(submissionID, cc.id, 1, respone.feedback, null)
  }

  override protected def handleChecker(submission: Submission, checkerConfiguration: CheckrunnerConfiguration,
                                       task: Task, exitCode: Int, resultText: String, extInfo: String): Unit = {}
}
