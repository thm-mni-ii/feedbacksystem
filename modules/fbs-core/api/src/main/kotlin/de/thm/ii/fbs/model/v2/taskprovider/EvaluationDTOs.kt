package de.thm.ii.fbs.model.v2.taskprovider

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.JsonNode

@JsonInclude(JsonInclude.Include.NON_NULL)
data class EvaluationUserContext(
    val id: Int,
    val username: String,
    val pseudonym: String
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class EvaluationSubmissionContext(
    val mediaType: String,
    val content: String? = null,
    val fileDownloadUrl: String? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class EvaluationWebhookRequest(
    val submissionId: Int,
    val checkerConfigId: Int,
    val taskId: Int,
    val courseId: Int,
    val user: EvaluationUserContext,
    val submission: EvaluationSubmissionContext,
    val configuration: JsonNode?,
    val callbackUrl: String,
    val callbackAuthToken: String
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class SubtaskEvaluationResultDTO(
    val name: String,
    val pointsAchieved: Double,
    val pointsMax: Double,
    val passed: Boolean,
    val feedback: String? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class EvaluationResultDTO(
    val exitCode: Int,
    val resultText: String,
    val points: Double? = null,
    val maxPoints: Double? = null,
    val subtasks: List<SubtaskEvaluationResultDTO>? = null,
    val extInfo: JsonNode? = null
)
