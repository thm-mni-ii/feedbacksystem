package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
import org.springframework.data.jpa.repository.JpaRepository

interface CheckerStorageRepository : JpaRepository<CheckerStorageEntity, Int> {
    fun findByConfigurationIdAndStorageKey(configurationId: Int, storageKey: String): CheckerStorageEntity?
}
