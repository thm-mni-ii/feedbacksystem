package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, User}
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceOnMainFileUpload}
import de.thm.ii.fbs.services.persistence.TaskService
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService
import org.json.JSONObject
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.web.client.RestTemplate

class PdfCheckerService extends CheckerService with CheckerServiceOnMainFileUpload {
  @Autowired
  private val restTemplate: RestTemplate = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val storageService: MinioStorageService = null

  @Value("${services.pdfChecker.baseUrl}")
  private val baseUrl: String = null

  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val task = taskService.getOne(taskID).get
    sendRequest("/submission/", new JSONObject()
      .put("submission_id", submissionID)
      .put("student_id", fu.id)
      .put("course_id", task.courseID)
      .put("task_id", task.id)
      .put("abgabe", storageService.getSolutionFileFromBucket(submissionID)))
  }

  override def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    sendRequest("/submission/solution", new JSONObject()
      .put("course_id", cid)
      .put("task_id", task.id)
      .put("abgabe", storageService.getMainFileFromBucket(checkerConfiguration.id)))
  }

  private def sendRequest(urlSuffix: String, body: JSONObject): JSONObject = {
    new JSONObject(restTemplate.postForEntity(baseUrl + urlSuffix, body.toString, classOf[String]))
  }
}
