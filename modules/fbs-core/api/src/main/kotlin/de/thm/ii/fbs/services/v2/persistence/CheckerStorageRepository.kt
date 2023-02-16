package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageId
import org.springframework.data.jpa.repository.JpaRepository
import javax.transaction.Transactional

interface CheckerStorageRepository : JpaRepository<CheckerStorageEntity, CheckerStorageId> {
    fun findByConfigurationIdAndStorageKey(configurationId: Int, storageKey: String): CheckerStorageEntity?

    @Transactional
    fun deleteByConfigurationIdAndStorageKey(configurationId: Int, storageKey: String)
}
