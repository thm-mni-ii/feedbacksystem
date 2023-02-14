package de.thm.ii.fbs.services.v2.checker.storage

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.services.v2.persistence.CheckerStorageRepository
import de.thm.ii.fbs.utils.v2.converters.ReferenceGraphDeserializer
import de.thm.ii.fbs.utils.v2.converters.ReferenceGraphSerializer
import org.springframework.stereotype.Service


@Service
class CheckerStorageService(val checkerStorageRepository: CheckerStorageRepository) {
    val objectMapper = ObjectMapper()

    init {
        val module = SimpleModule()
        module.addSerializer(ReferenceGraph::class.java, ReferenceGraphSerializer())
        module.addDeserializer(ReferenceGraph::class.java, ReferenceGraphDeserializer())
        objectMapper.registerModule(module)
    }

    private fun storeValueGen(configurationId: Int, storageKey: String, value: Any, submissionId: Int? = null) {
        checkerStorageRepository.insertOrUpdate(
            configurationId,
            submissionId,
            storageKey,
            objectMapper.valueToTree<JsonNode>(value).toString()
        )
    }

    fun storeValue(configurationId: Int, storageKey: String, value: Any) {
        storeValueGen(configurationId, storageKey, value)
    }

    fun storeSubmissionValue(configurationId: Int, submissionId: Int, storageKey: String, value: Any) {
        storeValueGen(configurationId, storageKey, value, submissionId)
    }

    inline fun <reified T> getValue(configurationId: Int, storageKey: String): T? {
        val value = checkerStorageRepository.findByConfigurationIdAndStorageKey(configurationId, storageKey)?.value
        return objectMapper.treeToValue(value, T::class.java)
    }

    inline fun <reified T> getSubmissionValue(configurationId: Int, submissionId: Int, storageKey: String): T? {
        val value = checkerStorageRepository.findByConfigurationIdAndSubmissionIdAndStorageKey(
            configurationId,
            submissionId,
            storageKey
        )?.value
        return objectMapper.treeToValue(value, T::class.java)
    }
}