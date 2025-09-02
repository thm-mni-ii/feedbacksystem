package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, User}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceOnMainFileUpload, CheckerServiceOnSecondaryFileUpload}
import de.thm.ii.fbs.services.persistence.{SubmissionService, TaskService}
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService
import de.thm.ii.fbs.util.RestTemplateFactory
import org.json.JSONObject
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.{HttpEntity, HttpHeaders}
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

import java.util.Base64

@Service
class PdfCheckerService extends CheckerService with CheckerServiceOnMainFileUpload with CheckerServiceOnSecondaryFileUpload {
  private val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(false)
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val storageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null

  private val encoder = Base64.getEncoder

  @Value("${services.pdfChecker.baseUrl}")
  private val baseUrl: String = null

  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val task = taskService.getOne(taskID).get
    val response = sendRequest("/submission/", new JSONObject()
      .put("submission_id", submissionID.toString)
      .put("student_id", fu.id.toString)
      .put("course_id", task.courseID.toString)
      .put("task_id", task.id.toString)
      .put("abgabe", encoder.encodeToString(storageService.getSolutionFileFromBucketAsBytes(submissionID))))

    submissionService.storeResult(submissionID, cc.id, 0, response.getString("abgabe"), "")
  }

  override def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    sendRequest("/submission/solution", new JSONObject()
      .put("course_id", cid.toString)
      .put("task_id", task.id.toString)
      .put("abgabe", encoder.encodeToString(storageService.getMainFileFromBucketAsBytes(checkerConfiguration.id))))
  }

  override def onCheckerSecondaryFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    sendRequest("/submission/sheet", new JSONObject()
      .put("course_id", cid.toString)
      .put("task_id", task.id.toString)
      .put("sheet", encoder.encodeToString(storageService.getSecondaryFileFromBucketAsBytes(checkerConfiguration.id))))
  }

  private def sendRequest(urlSuffix: String, body: JSONObject): JSONObject = {
    val headers = new HttpHeaders()
    headers.set("Content-Type", "application/json")
    new JSONObject(
      restTemplate.postForEntity(baseUrl + urlSuffix, new HttpEntity(body.toString, headers), classOf[String]).getBody
    )
  }
}
