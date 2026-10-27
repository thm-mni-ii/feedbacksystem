package de.thm.ii.fbs.services.v2.checker.storage

import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
import de.thm.ii.fbs.services.v2.persistence.CheckerStorageRepository
import de.thm.ii.fbs.utils.v2.converters.ReferenceGraphDeserializer
import de.thm.ii.fbs.utils.v2.converters.ReferenceGraphSerializer
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule

@Service
class CheckerStorageService(val checkerStorageRepository: CheckerStorageRepository) {
    val objectMapper: ObjectMapper = JsonMapper.builder()
        .addModule(
            SimpleModule()
                .addSerializer(ReferenceGraph::class.java, ReferenceGraphSerializer())
                .addDeserializer(ReferenceGraph::class.java, ReferenceGraphDeserializer())
        )
        .build()

    fun storeValue(configurationId: Int, storageKey: String, value: Any) {
        checkerStorageRepository.save(
            CheckerStorageEntity(
                configurationId,
                storageKey,
                objectMapper.valueToTree(value)
            )
        )
    }

    final inline fun <reified T> getValue(configurationId: Int, storageKey: String): T? {
        val value = checkerStorageRepository.findByConfigurationIdAndStorageKey(
            configurationId,
            storageKey
        )?.value
        return objectMapper.treeToValue(value, T::class.java)
    }

    final inline fun <reified T : Any> getOrStoreValue(configurationId: Int, storageKey: String, generateValue: () -> T): T {
        var value = this.getValue<T>(configurationId, storageKey)

        if (value != null) {
            return value
        }

        value = generateValue()
        this.storeValue(configurationId, storageKey, value)
        return value
    }

    fun deleteValue(configurationId: Int, storageKey: String) {
        checkerStorageRepository.deleteByConfigurationIdAndStorageKey(configurationId, storageKey)
    }
}
