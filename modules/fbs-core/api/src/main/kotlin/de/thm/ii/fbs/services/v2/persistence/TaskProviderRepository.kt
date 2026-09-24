package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TaskProviderRepository : JpaRepository<TaskProviderEntity, String> {
    fun findAllByIsActiveTrue(): List<TaskProviderEntity>
}
