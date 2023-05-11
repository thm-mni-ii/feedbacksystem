package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundQueryRepository : JpaRepository<SqlPlaygroundQuery, Int> {
    fun findByRunIn_Owner_IdOrCreatorIdAndRunIn_id(
        ownerId: Int,
        creatorId: Int,
        databaseId: Int
    ): List<SqlPlaygroundQuery>

    fun findByRunIn_Owner_IdOrCreatorIdAndRunIn_idAndId(
        ownerId: Int,
        creatorId: Int,
        databaseId: Int,
        queryId: Int
    ): SqlPlaygroundQuery?
}
