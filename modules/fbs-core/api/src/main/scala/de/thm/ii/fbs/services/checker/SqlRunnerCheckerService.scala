package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, User}
import de.thm.ii.fbs.model.checker.sqlRunner
import de.thm.ii.fbs.services.persistence.storage.MinioStorageService
import de.thm.ii.fbs.services.persistence.{SubmissionService, TaskService}
import org.json.JSONObject
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.{HttpHeaders, HttpMethod, MediaType, RequestEntity}
import org.springframework.stereotype.Service

import java.net.URI
import java.util.Optional
import scala.collection.convert.ImplicitConversions.`iterator asScala`
import scala.jdk.CollectionConverters.SeqHasAsJava
import scala.util.control.Breaks._

@Service
class SqlRunnerCheckerService(@Value("${services.sqlRunner.insecure}") insecure: Boolean) extends HttpCheckerService(insecure) {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null
  @Autowired
  private val submissionService: SubmissionService = null

  @Value("${services.sqlRunner.url}")
  private val url: String = null

  /**
   * Notify about the new submission
   *
   * @param taskID       the taskID for the submission
   * @param submissionID the id of the sumission
   * @param cc           the check runner of the sumission
   * @param fu           the user which triggered the sumission
   */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val schema = minioStorageService.getSecondaryFileFromBucket(cc.id)
    val submission = minioStorageService.getSolutionFileFromBucket(submissionID);
    val sections = new JSONObject(minioStorageService.getMainFileFromBucket(cc.id)).getJSONArray("sections")
    val solutions = sections.iterator()
      .map(o => Seq(o.asInstanceOf[JSONObject].getString("query"), Optional.ofNullable(o.asInstanceOf[JSONObject].getString("order")).orElse("fix") match {
        case "variable" => "NormalizeAll"
        case _ => "NoNormalization"
      }).asJava).toSeq

    val headers = new HttpHeaders()
    headers.setContentType(MediaType.APPLICATION_JSON)
    val request = sqlRunner.Request(
      environment = schema,
      solutions = solutions,
      submission = submission,
    )

    println(request.toJson.toString)
    val requestEntity = new RequestEntity[String](request.toJson.toString, headers, HttpMethod.POST, new URI(url))
    val responseEntity = this.restTemplate.exchange(
      requestEntity,
      Class.forName("java.lang.String"),
    )
    val response = sqlRunner.Response.fromJson(responseEntity.getBody.toString)
    var exit_code = 1
    var resultText = "Your Query didn't produce the correct result"
    breakable {
      for ((ok, i) <- response.equal.zipWithIndex) {
        if (ok) {
          val description = sections.getJSONObject(i).getString("description")
          if (description == "OK") {
            exit_code = 0
          }
          resultText = description
          break
        }
      }
    }

    submissionService.storeResult(submissionID, cc.id, exit_code, resultText, null)
  }
}
