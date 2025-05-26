package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.checker._
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission => FBSSubmission, User => FBSUser}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceHandle}
import de.thm.ii.fbs.services.persistence.storage.{FsStorageService, MinioStorageService}
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, SubmissionService}
import de.thm.ii.fbs.util.RestTemplateFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Primary
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

import java.nio.file.Path

/**
  * Communicate with an remote checker to notify him about new submissions
  *
  * @param insecure if true the tls certificate of the remote checker will not be validated
  */
@Service
@Primary
class RemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends CheckerService with CheckerServiceHandle {
  protected val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(insecure)

  @Autowired
  private val fsStorageService: FsStorageService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val subTaskServier: CheckrunnerSubTaskService = null

  @Value("${storage.uploadDir}")
  private val uploadDir: String = null

  private def uploadDirPath: Path = Path.of(uploadDir)

  @Value("${services.masterRunner.url}")
  protected val masterRunnerURL: String = null

  /**
    * Notify the runner about a new submission
    *
    * @param taskID       the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc           the CheckrunnerConfiguration to use
    * @param fu           the User model
    */
  def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: FBSUser): Unit = {
    val solUrl = minioStorageService.urlToSolutionFile(submissionID)
    val submission = SqlRunnerSubmission(submissionID, User(fu.id, fu.username), solUrl)

    sendNotificationToRemote(taskID, submission, cc)
  }

  protected def sendNotificationToRemote(taskID: Int, submission: Submission, cc: CheckrunnerConfiguration): Unit = {
    val request = RunnerRequest(taskID, generateRunnerConfiguration(cc), submission)
    val res = restTemplate.postForEntity(masterRunnerURL + "/runner/start", request.toJson, classOf[Unit])
    if (res.getStatusCode != HttpStatus.ACCEPTED) {
      throw new Exception(s"invalid status code from runner: ${res.getStatusCode}")
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
  def handle(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
             resultText: String, extInfo: String): Unit = storeResult(submission, checkerConfiguration, task, exitCode, resultText, extInfo)

  protected def storeResult(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
    resultText: String, extInfo: String): Unit =
      submissionService.storeResult(submission.id, checkerConfiguration.id, exitCode, resultText, extInfo)

  protected def generateRunnerConfiguration(cc: CheckrunnerConfiguration): RunnerConfiguration = {
    val files =
      if (cc.isInBlockStorage) {
        val mainFileUrl = minioStorageService.urlToMainFile(cc)
        val secFileUrl = minioStorageService.urlToSecondaryFile(cc)

        RunnerConfigurationFiles(RunnerConfigurationFilesType.URL, mainFileUrl, secFileUrl)
      } else {
        val mainFilePath = fsStorageService.pathToMainFile(cc.id).map(relativeToUploadDir).map(_.toString)
        val secFilePath = fsStorageService.pathToSecondaryFile(cc.id).map(relativeToUploadDir).map(_.toString)

        RunnerConfigurationFiles(RunnerConfigurationFilesType.PATH, mainFilePath, secFilePath)
      }

    RunnerConfiguration(cc.id, cc.checkerType, files)
  }

  private def relativeToUploadDir(path: Path) = uploadDirPath.relativize(path)
}
