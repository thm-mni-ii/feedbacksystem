package de.thm.ii.fbs.services.v2.checker.storage

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
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

    fun storeValue(configurationId: Int, storageKey: String, value: Any) {
        checkerStorageRepository.save(
            CheckerStorageEntity(
                configurationId,
                storageKey,
                objectMapper.valueToTree(value)
            )
        )
    }

    inline fun <reified T> getValue(configurationId: Int, storageKey: String): T? {
        val value = checkerStorageRepository.findByConfigurationIdAndStorageKey(
            configurationId,
            storageKey
        )?.value
        return objectMapper.treeToValue(value, T::class.java)
    }

    inline fun <reified T : Any> getOrStoreValue(configurationId: Int, storageKey: String, generateValue: () -> T): T {
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
