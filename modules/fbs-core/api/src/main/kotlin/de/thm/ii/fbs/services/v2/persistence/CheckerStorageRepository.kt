package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.checker.storage.CheckerStorageEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import javax.transaction.Transactional

interface CheckerStorageRepository : JpaRepository<CheckerStorageEntity, Int> {
    fun findByConfigurationIdAndStorageKey(configurationId: Int, storageKey: String): CheckerStorageEntity?
    fun findByConfigurationIdAndSubmissionIdAndStorageKey(
        configurationId: Int,
        submissionId: Int,
        storageKey: String
    ): CheckerStorageEntity?

    @Modifying
    @Transactional
    @Query(
        value = "INSERT INTO checkrunner_storage(configuration_id, submission_id, storage_key, value) " +
                "VALUES (:configurationId, :submissionId, :storageKey, :value) ON DUPLICATE KEY UPDATE value = :value",
        nativeQuery = true
    )
    fun insertOrUpdate(
        @Param("configurationId") configurationId: Int,
        @Param("submissionId") submissionId: Int?,
        @Param("storageKey") storageKey: String,
        @Param("value") value: String
    )
}
