package de.thm.ii.fbs.services.v2.taskprovider

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.taskprovider.EvaluationSubmissionContext
import de.thm.ii.fbs.model.v2.taskprovider.EvaluationUserContext
import de.thm.ii.fbs.model.v2.taskprovider.EvaluationWebhookRequest
import de.thm.ii.fbs.services.v2.security.ScopedTaskTokenService
import de.thm.ii.fbs.utils.v2.helpers.RestTemplateFactory
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.util.concurrent.CompletableFuture

@Service
class TaskProviderDispatcherService(
    private val scopedTaskTokenService: ScopedTaskTokenService,
    private val taskProviderService: TaskProviderService,
    private val objectMapper: ObjectMapper,
    @Value("\${services.self.url:https://core:443}")
    private val selfUrl: String,
    @Value("\${services.masterRunner.insecure:true}")
    private val insecure: Boolean
) {
    private val logger = LoggerFactory.getLogger(this.javaClass)
    private val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(insecure)

    /**
     * Dispatches an asynchronous evaluation request to the specified TaskProvider.
     */
    fun dispatchEvaluation(
        providerId: String,
        submissionId: Int,
        checkerConfigId: Int,
        taskId: Int,
        courseId: Int,
        userId: Int,
        username: String,
        mediaType: String,
        submissionContent: String? = null,
        fileDownloadUrl: String? = null,
        configurationNode: JsonNode? = null
    ): CompletableFuture<Boolean> {
        return CompletableFuture.supplyAsync {
            try {
                val provider = taskProviderService.findEntityById(providerId)
                    ?: throw IllegalArgumentException("TaskProvider '$providerId' not found")

                val callbackToken = scopedTaskTokenService.issueEvaluationCallbackToken(
                    submissionId = submissionId,
                    checkerConfigId = checkerConfigId,
                    taskId = taskId,
                    courseId = courseId
                )

                val pseudonym = scopedTaskTokenService.generatePseudonym(userId, courseId)
                val callbackUrl = "$selfUrl/api/v1/results/$submissionId/$checkerConfigId"

                val requestPayload = EvaluationWebhookRequest(
                    submissionId = submissionId,
                    checkerConfigId = checkerConfigId,
                    taskId = taskId,
                    courseId = courseId,
                    user = EvaluationUserContext(
                        id = userId,
                        username = username,
                        pseudonym = pseudonym
                    ),
                    submission = EvaluationSubmissionContext(
                        mediaType = mediaType,
                        content = submissionContent,
                        fileDownloadUrl = fileDownloadUrl
                    ),
                    configuration = configurationNode,
                    callbackUrl = callbackUrl,
                    callbackAuthToken = callbackToken
                )

                val headers = HttpHeaders().apply {
                    contentType = MediaType.APPLICATION_JSON
                    set("Authorization", "Bearer $callbackToken")
                }

                val httpEntity = HttpEntity(requestPayload, headers)

                logger.info("Dispatching evaluation for submission $submissionId (checkerConfig: $checkerConfigId) to ${provider.evaluationEndpointUrl}")
                val response = restTemplate.postForEntity(provider.evaluationEndpointUrl, httpEntity, String::class.java)

                if (response.statusCode.is2xxSuccessful) {
                    logger.info("TaskProvider ${provider.id} accepted evaluation for submission $submissionId with status ${response.statusCode}")
                    true
                } else {
                    logger.warn("TaskProvider ${provider.id} returned status ${response.statusCode} for submission $submissionId")
                    false
                }
            } catch (e: Exception) {
                logger.error("Failed to dispatch evaluation for submission $submissionId to provider $providerId: ${e.message}", e)
                false
            }
        }
    }
}
