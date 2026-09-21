package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission => FBSSubmission, User => FBSUser}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceHandle}
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService
import de.thm.ii.fbs.services.persistence.{SubmissionService, TaskService}
import de.thm.ii.fbs.services.v2.taskprovider.TaskProviderDispatcherService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

/**
  * TaskProviderCheckerService integrates external TaskProviders into the submission workflow.
  */
@Service
class TaskProviderCheckerService extends CheckerService with CheckerServiceHandle {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @Autowired
  private val dispatcherService: TaskProviderDispatcherService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null

  /**
    * Notify the external TaskProvider about a new submission.
    *
    * @param taskID       the id of the task
    * @param submissionID the id of the submission
    * @param cc           the CheckrunnerConfiguration to use
    * @param fu           the User model
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: FBSUser): Unit = {
    val task = taskService.getOne(taskID) match {
      case Some(t) => t
      case None =>
        logger.warn(s"Task $taskID not found when notifying TaskProvider ${cc.checkerType}")
        return
    }

    val solUrl = try {
      minioStorageService.urlToSolutionFile(submissionID)
    } catch {
      case e: Exception =>
        logger.warn(s"Could not resolve MinIO solution URL for submission $submissionID: ${e.getMessage}")
        null
    }

    dispatcherService.dispatchEvaluation(
      cc.checkerType,
      submissionID,
      cc.id,
      taskID,
      task.courseID,
      fu.id,
      fu.username,
      task.mediaType,
      null,
      solUrl,
      null
    )
  }

  /**
    * Handles evaluation result ingestion.
    *
    * @param submission           The submission
    * @param checkerConfiguration The check runner configuration
    * @param task                 The task
    * @param exitCode             The exit Code
    * @param resultText           The resultText
    * @param extInfo              Extended runner information
    */
  override def handle(
    submission: FBSSubmission,
    checkerConfiguration: CheckrunnerConfiguration,
    task: Task,
    exitCode: Int,
    resultText: String,
    extInfo: String
  ): Unit = {
    submissionService.storeResult(submission.id, checkerConfiguration.id, exitCode, resultText, extInfo)
  }
}
