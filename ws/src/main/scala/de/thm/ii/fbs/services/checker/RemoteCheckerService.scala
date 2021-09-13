package de.thm.ii.fbs.services.checker

import java.nio.file.{Files, Path, Paths}
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SubTaskResult, User => FBSUser}
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.apache.http.conn.ssl.{NoopHostnameVerifier, SSLConnectionSocketFactory, TrustSelfSignedStrategy}
import org.apache.http.impl.client.HttpClients
import org.apache.http.ssl.SSLContextBuilder
import org.json.JSONArray
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

/**
  * Communicate with an remote checker to notify him about new submissions
  * @param insecure if true the tls certificate of the remote checker will not be validated
  */
@Service
class RemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends CheckerService {
  private val restTemplate = makeRestTemplate(insecure)

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
  private val masterRunnerURL: String = null

  /**
    * Notify the runner about a new submission
    * @param taskID the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc the CheckrunnerConfiguration to use
    * @param fu the User model
    */
  def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: FBSUser): Unit = {
    val submission = Submission(submissionID, User(fu.id, fu.username),
      storageService.pathToSolutionFile(submissionID).map(relativeToUploadDir).map(_.toString).get,
      storageService.pathToSubTaskFile(submissionID).map(relativeToUploadDir).map(_.toString).get
    )
    val request = RunnerRequest(taskID, rcFromCC(cc), submission)
    val res = restTemplate.postForEntity(masterRunnerURL + "/runner/start", request.toJson, classOf[Unit])
    if (res.getStatusCode != HttpStatus.ACCEPTED) {
      throw new Exception(s"invalid status code from runner: ${res.getStatusCode}")
    }
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
  def handle(sid: Int, ccid: Int, exitCode: Int, resultText: String, extInfo: String): Unit = {
    submissionService.storeResult(sid, ccid, exitCode, resultText, extInfo)
    handleSubTasks(sid, ccid)
  }

  private def rcFromCC(cc: CheckrunnerConfiguration): RunnerConfiguration = RunnerConfiguration(
    cc.id, cc.checkerType, storageService.pathToMainFile(cc.id).map(relativeToUploadDir).map(_.toString),
    cc.secondaryFileUploaded, storageService.pathToSecondaryFile(cc.id).map(relativeToUploadDir).map(_.toString)
  )

  private def relativeToUploadDir(path: Path) = uploadDirPath.relativize(path)

  private case class RunnerConfiguration(id: Int, typ: String,
                                         mainFileLocation: Option[String], hasSecondaryFile: Boolean,
                                         secondaryFileLocation: Option[String]) {
    /**
      * Transforms RunnerConfiguration to JsonNode
      * @return json representation
      */
    def toJson: JsonNode = {
      val json = new ObjectMapper().createObjectNode()
      json.put("id", this.id)
      json.put("type", this.typ)
      this.mainFileLocation match {
        case Some(mainFileLocation) => json.put("mainFileLocation", mainFileLocation)
        case None => json.putNull("mainFileLocation")
      }
      json.put("hasSecondaryFile", this.hasSecondaryFile)
      this.secondaryFileLocation match {
        case Some(secondaryFileLocation) => json.put("secondaryFileLocation", secondaryFileLocation)
        case None => json.putNull("secondaryFileLocation")
      }
      json
    }
  }

  private case class User(id: Int, username: String) {
    /**
      * Transforms User to JsonNode
      * @return json representation
      */
    def toJson: JsonNode = {
      val json = new ObjectMapper().createObjectNode()
      json.put("id", this.id)
      json.put("username", this.username)
      json
    }
  }

  private case class Submission(id: Int, user: User, solutionFileLocation: String, subTaskFileLocation: String) {
    /**
      * Transforms RunnerConfiguration to JsonNode
      * @return json representation
      */
    def toJson: JsonNode = {
      val json = new ObjectMapper().createObjectNode()
      json.put("id", this.id)
      json.set("user", this.user.toJson)
      json.put("solutionFileLocation", this.solutionFileLocation)
      json.put("subTaskFileLocation", this.subTaskFileLocation)
      json
    }
  }

  private case class RunnerRequest(taskID: Int,
                           runnerConfiguration: RunnerConfiguration,
                           submission: Submission) {
    /**
      * Transforms RunnerRequest to JsonNode
      * @return json representation
      */
    def toJson: JsonNode = {
      val json = new ObjectMapper().createObjectNode()
      json.put("taskId", this.taskID)
      json.set("runner", this.runnerConfiguration.toJson)
      json.set("submission", this.submission.toJson)
      json
    }
  }

  private def handleSubTasks(sid: Int, ccid: Int): Unit = {
    val solutionPath = storageService.pathToSolutionFile(sid).get
    val content = Files.readString(solutionPath)
    val tasks = new JSONArray(content)
    val results = (0 to tasks.length()).map(i => SubTaskResult.fromJSON(tasks.getJSONObject(i)))
    for (SubTaskResult(name, maxPoints, points) <- results) {
      val subTask = subTaskServier.getOrCrate(ccid, name, maxPoints)
      subTaskServier.createResult(ccid, subTask.subTaskId, sid, points)
    }
  }

  private def makeRestTemplate(insecure: Boolean = false): RestTemplate = {
    val requestFactory = new HttpComponentsClientHttpRequestFactory()
    if (insecure) {
      val sslContextBuilder = new SSLContextBuilder()
      sslContextBuilder.loadTrustMaterial(null, new TrustSelfSignedStrategy)
      val socketFactory = new SSLConnectionSocketFactory(sslContextBuilder.build, NoopHostnameVerifier.INSTANCE)
      val httpClient = HttpClients.custom.setSSLSocketFactory(socketFactory).build()
      requestFactory.setHttpClient(httpClient)
    }
    new RestTemplate(requestFactory)
  }
}
