package de.thm.ii.fbs.services.v2.checker.storage

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
import de.thm.ii.fbs.services.v2.persistence.CheckerStorageRepository
import org.springframework.stereotype.Service

@Service
class CheckerStorageService(val checkerStorageRepository: CheckerStorageRepository) {
    val objectMapper = ObjectMapper()

    private fun storeValueGen(configurationId: Int, storageKey: String, value: Any, submissionId: Int? = null) {
        checkerStorageRepository.save(
            CheckerStorageEntity(
                configurationId = configurationId,
                submissionId = submissionId,
                storageKey = storageKey,
                value = objectMapper.valueToTree(value)
            )
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