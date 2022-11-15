package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundEntityRepository : JpaRepository<SqlPlaygroundEntity, Int> {
    fun findByDatabase_Owner_IdAndDatabase_idAndType(ownerId: Int, databaseId: Int, type: String): SqlPlaygroundEntity?
}
