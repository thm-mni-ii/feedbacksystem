package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import org.springframework.data.jpa.repository.JpaRepository

interface SqlPlaygroundDatabaseRepository : JpaRepository<SqlPlaygroundDatabase, Int> {
    fun findByOwner_IdAndDeleted(ownerId: Int, deleted: Boolean): List<SqlPlaygroundDatabase>
    fun findByOwner_IdAndIdAndDeleted(ownerId: Int, id: Int, deleted: Boolean): SqlPlaygroundDatabase?
    fun findByOwner_IdAndActiveAndDeleted(ownerId: Int, active: Boolean, deleted: Boolean): SqlPlaygroundDatabase?
    fun findByIdAndDeleted(id: Int, deleted: Boolean): SqlPlaygroundDatabase?
    fun findByShareWithGroup(shareWithGroup: Int): SqlPlaygroundDatabase?
}
