package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundEntityRepository : JpaRepository<SqlPlaygroundEntity, Int> {
    fun findByDatabase_Owner_IdAndDatabase_idAndDatabase_DeletedAndType(ownerId: Int, databaseId: Int, deleted: Boolean, type: String): SqlPlaygroundEntity?
    fun findByDatabase_idAndDatabase_DeletedAndType(databaseId: Int, deleted: Boolean, type: String): SqlPlaygroundEntity?
}
