package de.thm.ii.fbs.model.v2.taskprovider

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.JsonNode

@JsonInclude(JsonInclude.Include.NON_NULL)
data class TaskProviderDTO(
    val id: String,
    val displayName: String,
    val description: String?,
    val icon: String,
    val version: String,
    val evaluationEndpointUrl: String,
    val healthEndpointUrl: String,
    val configUiUrl: String?,
    val solveUiUrl: String?,
    val resultUiUrl: String?,
    val supportedMediaTypes: List<String>,
    val hasSubtasks: Boolean,
    val supportsStagedFeedback: Boolean,
    val configSchema: JsonNode?,
    val isActive: Boolean
)

data class CreateTaskProviderRequest(
    val id: String,
    val displayName: String,
    val description: String? = null,
    val icon: String,
    val version: String,
    val evaluationEndpointUrl: String,
    val healthEndpointUrl: String,
    val configUiUrl: String? = null,
    val solveUiUrl: String? = null,
    val resultUiUrl: String? = null,
    val supportedMediaTypes: List<String> = emptyList(),
    val hasSubtasks: Boolean = false,
    val supportsStagedFeedback: Boolean = false,
    val configSchema: JsonNode? = null,
    val isActive: Boolean = true
)

data class UpdateTaskProviderRequest(
    val displayName: String? = null,
    val description: String? = null,
    val icon: String? = null,
    val version: String? = null,
    val evaluationEndpointUrl: String? = null,
    val healthEndpointUrl: String? = null,
    val configUiUrl: String? = null,
    val solveUiUrl: String? = null,
    val resultUiUrl: String? = null,
    val supportedMediaTypes: List<String>? = null,
    val hasSubtasks: Boolean? = null,
    val supportsStagedFeedback: Boolean? = null,
    val configSchema: JsonNode? = null,
    val isActive: Boolean? = null
)
