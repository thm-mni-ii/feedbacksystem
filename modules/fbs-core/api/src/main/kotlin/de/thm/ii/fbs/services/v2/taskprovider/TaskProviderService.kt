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
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TaskProviderService(
    private val taskProviderRepository: TaskProviderRepository,
    private val objectMapper: ObjectMapper
) {

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
