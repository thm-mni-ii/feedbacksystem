package de.thm.ii.fbs.services.checker

import java.nio.file.{Files, NoSuchFileException, Path}
import de.thm.ii.fbs.model.checker.{RunnerConfiguration, RunnerRequest, User, Submission, SqlRunnerSubmission}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SubTaskResult, Task, Submission => FBSSubmission, User => FBSUser}
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceHandle}
import de.thm.ii.fbs.util.RestTemplateFactory
import org.json.JSONArray
import org.springframework.context.annotation.Primary
import org.springframework.web.client.RestTemplate

/**
  * Communicate with an remote checker to notify him about new submissions
  * @param insecure if true the tls certificate of the remote checker will not be validated
  */
@Service
@Primary
class RemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends CheckerService with CheckerServiceHandle {
  protected val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(insecure)

  @Autowired
  private val storageService: StorageService = null
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
    * @param taskID the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc the CheckrunnerConfiguration to use
    * @param fu the User model
    */
  def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: FBSUser): Unit = {
    val submission = SqlRunnerSubmission(submissionID, User(fu.id, fu.username),
      if (cc.isInBlockStorage){

      } else {
        storageService.pathToSolutionFile(submissionID).map(relativeToUploadDir).map(_.toString).get,
        storageService.pathToSubTaskFile(submissionID).map(relativeToUploadDir).map(_.toString).get
      }
    )
    sendNotificationToRemote(taskID, submission, cc)
  }

  protected def sendNotificationToRemote(taskID: Int, submission: Submission, cc: CheckrunnerConfiguration): Unit = {
    val request = RunnerRequest(taskID, rcFromCC(cc), submission)
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
    * @param exitCode   The exit Code of the runner
    * @param resultText The resultText of the runner
    * @param extInfo    Extended runner information
    */
  def handle(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
             resultText: String, extInfo: String): Unit = {
    submissionService.storeResult(submission.id, checkerConfiguration.id, exitCode, resultText, extInfo)
    handleSubTasks(submission.id, checkerConfiguration.id)
  }

  protected def rcFromCC(cc: CheckrunnerConfiguration): RunnerConfiguration = RunnerConfiguration(
    cc.id, cc.checkerType, storageService.pathToMainFile(cc.id).map(relativeToUploadDir).map(_.toString),
    cc.secondaryFileUploaded, storageService.pathToSecondaryFile(cc.id).map(relativeToUploadDir).map(_.toString)
  )

  private def relativeToUploadDir(path: Path) = uploadDirPath.relativize(path)

  private def handleSubTasks(sid: Int, ccid: Int): Unit = {
    val subTaskPath = storageService.pathToSubTaskFile(sid).get
    try {
      val content = Files.readString(subTaskPath)
      val tasks = new JSONArray(content)
      val results = (0 to tasks.length()).map(i => SubTaskResult.fromJSON(tasks.getJSONObject(i)))
      for (SubTaskResult(name, maxPoints, points) <- results) {
        val subTask = subTaskServier.getOrCrate(ccid, name, maxPoints)
        subTaskServier.createResult(ccid, subTask.subTaskId, sid, points)
      }
    } catch {
      case _: NoSuchFileException =>
    }
  }
}
