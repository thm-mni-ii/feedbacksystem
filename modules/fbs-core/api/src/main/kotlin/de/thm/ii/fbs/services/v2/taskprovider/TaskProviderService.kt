package de.thm.ii.fbs.services.v2.taskprovider

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.taskprovider.CreateTaskProviderRequest
import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderDTO
import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderEntity
import de.thm.ii.fbs.model.v2.taskprovider.UpdateTaskProviderRequest
import de.thm.ii.fbs.services.v2.persistence.TaskProviderRepository
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import de.thm.ii.fbs.utils.v2.helpers.RestTemplateFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate

@Service
class TaskProviderService(
    private val taskProviderRepository: TaskProviderRepository,
    private val objectMapper: ObjectMapper,
    @Value("\${services.masterRunner.insecure:true}")
    private val insecure: Boolean = true
) {
    private val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(insecure)

    fun getAllActive(): List<TaskProviderDTO> {
        return taskProviderRepository.findAllByIsActiveTrue().map { toDto(it) }
    }

    fun getAll(): List<TaskProviderDTO> {
        return taskProviderRepository.findAll().map { toDto(it) }
    }

    fun getById(id: String): TaskProviderDTO {
        val entity = taskProviderRepository.findByIdOrNull(id) ?: throw NotFoundException()
        return toDto(entity)
    }

    fun findEntityById(id: String): TaskProviderEntity? {
        return taskProviderRepository.findByIdOrNull(id)
    }

    @Transactional
    fun create(request: CreateTaskProviderRequest): TaskProviderDTO {
        if (taskProviderRepository.existsById(request.id)) {
            throw IllegalArgumentException("Task provider with id ${request.id} already exists")
        }

        val mediaTypesJson = objectMapper.writeValueAsString(request.supportedMediaTypes)
        val schemaJson = request.configSchema?.let { objectMapper.writeValueAsString(it) }

        val entity = TaskProviderEntity(
            id = request.id,
            displayName = request.displayName,
            description = request.description,
            icon = request.icon,
            version = request.version,
            evaluationEndpointUrl = request.evaluationEndpointUrl,
            healthEndpointUrl = request.healthEndpointUrl,
            configUiUrl = request.configUiUrl,
            solveUiUrl = request.solveUiUrl,
            resultUiUrl = request.resultUiUrl,
            supportedMediaTypes = mediaTypesJson,
            hasSubtasks = request.hasSubtasks,
            supportsStagedFeedback = request.supportsStagedFeedback,
            configSchema = schemaJson,
            isActive = request.isActive
        )

        return toDto(taskProviderRepository.save(entity))
    }

    @Transactional
    fun update(id: String, request: UpdateTaskProviderRequest): TaskProviderDTO {
        val entity = taskProviderRepository.findByIdOrNull(id) ?: throw NotFoundException()

        request.displayName?.let { entity.displayName = it }
        request.description?.let { entity.description = it }
        request.icon?.let { entity.icon = it }
        request.version?.let { entity.version = it }
        request.evaluationEndpointUrl?.let { entity.evaluationEndpointUrl = it }
        request.healthEndpointUrl?.let { entity.healthEndpointUrl = it }
        request.configUiUrl?.let { entity.configUiUrl = it }
        request.solveUiUrl?.let { entity.solveUiUrl = it }
        request.resultUiUrl?.let { entity.resultUiUrl = it }
        request.hasSubtasks?.let { entity.hasSubtasks = it }
        request.supportsStagedFeedback?.let { entity.supportsStagedFeedback = it }
        request.isActive?.let { entity.isActive = it }

        if (request.supportedMediaTypes != null) {
            entity.supportedMediaTypes = objectMapper.writeValueAsString(request.supportedMediaTypes)
        }

        if (request.configSchema != null) {
            entity.configSchema = objectMapper.writeValueAsString(request.configSchema)
        }

        return toDto(taskProviderRepository.save(entity))
    }

    @Transactional
    fun delete(id: String) {
        val entity = taskProviderRepository.findByIdOrNull(id) ?: throw NotFoundException()
        entity.isActive = false
        taskProviderRepository.save(entity)
    }

    fun parseManifestFromUrl(manifestUrl: String): CreateTaskProviderRequest {
        val trimmedUrl = manifestUrl.trim()
        val response = try {
            restTemplate.getForEntity(trimmedUrl, String::class.java)
        } catch (e: Exception) {
            throw IllegalArgumentException("Could not fetch manifest from $trimmedUrl: ${e.message}", e)
        }

        if (!response.statusCode.is2xxSuccessful || response.body.isNullOrBlank()) {
            throw IllegalArgumentException("Failed to fetch manifest: HTTP ${response.statusCode}")
        }

        val rootNode = try {
            objectMapper.readTree(response.body)
        } catch (e: Exception) {
            throw IllegalArgumentException("Manifest response is not valid JSON: ${e.message}", e)
        }

        val id = rootNode.path("id").asText().takeIf { it.isNotBlank() }
            ?: throw IllegalArgumentException("Manifest must contain a non-empty 'id'")
        val displayName = rootNode.path("displayName").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("name").asText().takeIf { it.isNotBlank() }
            ?: id
        val description = rootNode.path("description").asText().takeIf { it.isNotBlank() }
        val icon = rootNode.path("icon").asText().takeIf { it.isNotBlank() } ?: "extension"
        val version = rootNode.path("version").asText().takeIf { it.isNotBlank() } ?: "1.0.0"

        val endpoints = rootNode.path("endpoints")
        val evaluationUrl = endpoints.path("evaluationUrl").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("evaluationEndpointUrl").asText().takeIf { it.isNotBlank() }
            ?: ""
        val healthUrl = endpoints.path("healthUrl").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("healthEndpointUrl").asText().takeIf { it.isNotBlank() }
            ?: ""
        val configUiUrl = endpoints.path("configUiUrl").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("configUiUrl").asText().takeIf { it.isNotBlank() }
        val solveUiUrl = endpoints.path("solveUiUrl").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("solveUiUrl").asText().takeIf { it.isNotBlank() }
        val resultUiUrl = endpoints.path("resultUiUrl").asText().takeIf { it.isNotBlank() }
            ?: rootNode.path("resultUiUrl").asText().takeIf { it.isNotBlank() }

        val supportedMediaTypes = mutableListOf<String>()
        val mediaTypesNode = rootNode.path("supportedMediaTypes")
        if (mediaTypesNode.isArray) {
            mediaTypesNode.forEach {
                val mt = it.asText().trim()
                if (mt.isNotBlank()) supportedMediaTypes.add(mt)
            }
        }

        val capabilities = rootNode.path("capabilities")
        val hasSubtasks = if (capabilities.has("hasSubtasks")) {
            capabilities.path("hasSubtasks").asBoolean(false)
        } else {
            rootNode.path("hasSubtasks").asBoolean(false)
        }
        val supportsStagedFeedback = if (capabilities.has("supportsStagedFeedback")) {
            capabilities.path("supportsStagedFeedback").asBoolean(false)
        } else {
            rootNode.path("supportsStagedFeedback").asBoolean(false)
        }

        val configSchemaNode = if (rootNode.has("configSchema") && !rootNode.path("configSchema").isNull) {
            rootNode.path("configSchema")
        } else {
            null
        }

        return CreateTaskProviderRequest(
            id = id,
            displayName = displayName,
            description = description,
            icon = icon,
            version = version,
            evaluationEndpointUrl = evaluationUrl,
            healthEndpointUrl = healthUrl,
            configUiUrl = configUiUrl,
            solveUiUrl = solveUiUrl,
            resultUiUrl = resultUiUrl,
            supportedMediaTypes = supportedMediaTypes,
            hasSubtasks = hasSubtasks,
            supportsStagedFeedback = supportsStagedFeedback,
            configSchema = configSchemaNode,
            isActive = true
        )
    }

    private fun toDto(entity: TaskProviderEntity): TaskProviderDTO {
        val mediaTypes: List<String> = try {
            objectMapper.readValue(entity.supportedMediaTypes, object : TypeReference<List<String>>() {})
        } catch (e: Exception) {
            emptyList()
        }

        val configSchemaNode: JsonNode? = entity.configSchema?.let {
            try {
                objectMapper.readTree(it)
            } catch (e: Exception) {
                null
            }
        }

        return TaskProviderDTO(
            id = entity.id,
            displayName = entity.displayName,
            description = entity.description,
            icon = entity.icon,
            version = entity.version,
            evaluationEndpointUrl = entity.evaluationEndpointUrl,
            healthEndpointUrl = entity.healthEndpointUrl,
            configUiUrl = entity.configUiUrl,
            solveUiUrl = entity.solveUiUrl,
            resultUiUrl = entity.resultUiUrl,
            supportedMediaTypes = mediaTypes,
            hasSubtasks = entity.hasSubtasks,
            supportsStagedFeedback = entity.supportsStagedFeedback,
            configSchema = configSchemaNode,
            isActive = entity.isActive
        )
    }
}
