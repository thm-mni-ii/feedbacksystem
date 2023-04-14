package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundQueryRepository : JpaRepository<SqlPlaygroundQuery, Int> {
    fun findByRunIn_Owner_IdAndRunIn_id(ownerId: Int, databaseId: Int): List<SqlPlaygroundQuery>
    fun findByRunIn_Owner_IdAndRunIn_idAndId(ownerId: Int, databaseId: Int, queryId: Int): SqlPlaygroundQuery?
    fun findByRunIn_Creator_IdAndRunIn_idAndId(creatorId: Int, databaseId: Int, queryId: Int): SqlPlaygroundQuery?
    fun findAllByCreatorIdAndDatabaseId(creatorId: Int, databaseId: Int): List<SqlPlaygroundQuery>
}
