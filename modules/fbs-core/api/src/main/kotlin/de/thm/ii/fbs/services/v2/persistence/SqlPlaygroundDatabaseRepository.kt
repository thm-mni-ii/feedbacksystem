package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundDatabaseRepository : JpaRepository<SqlPlaygroundDatabase, Int> {
    fun findByOwner_Id(ownerId: Int): List<SqlPlaygroundDatabase>
    fun findByOwner_IdAndId(ownerId: Int, id: Int): SqlPlaygroundDatabase?
    fun findByOwner_IdAndActive(ownerId: Int, active: Boolean): SqlPlaygroundDatabase?
}
