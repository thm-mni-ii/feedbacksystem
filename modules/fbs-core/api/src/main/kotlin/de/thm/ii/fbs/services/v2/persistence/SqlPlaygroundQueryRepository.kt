package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SqlPlaygroundQueryRepository : JpaRepository<SqlPlaygroundQuery, Int> {
    fun findByRunIn_Owner_IdAndRunIn_id(ownerId: Int, databaseId: Int): List<SqlPlaygroundQuery>
    fun findByRunIn_Owner_IdAndRunIn_idAndId(ownerId: Int, databaseId: Int, queryId: Int): SqlPlaygroundQuery?
    @Query("SELECT * FROM fbs.sql_playground_query WHERE creatorId = ?1 AND runIn = ?2 AND id = ?3", nativeQuery = true)
    fun findByCreatorIdAndRunInidAndId(userId: Int, databaseId: Int, queryId: Int): SqlPlaygroundQuery?
    @Query("SELECT * FROM fbs.sql_playground_query WHERE creatorId = ?1 AND runIn = ?2", nativeQuery = true)
    fun findByCreatorIdAndRunInid(userId: Int, databaseId: Int): List<SqlPlaygroundQuery>
}
