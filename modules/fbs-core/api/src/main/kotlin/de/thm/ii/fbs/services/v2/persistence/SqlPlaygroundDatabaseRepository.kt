package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SqlPlaygroundDatabaseRepository : JpaRepository<SqlPlaygroundDatabase, Int> {
    fun findByOwner_IdAndDeleted(ownerId: Int, deleted: Boolean): List<SqlPlaygroundDatabase>

    @Query(
        "select * from sql_playground_database d left join sql_users u on d.id = u.db_id where d.deleted = :deleted and (d.owner_user_id = :userId or u.user_user_id = :userId)",
        nativeQuery = true
    )
    fun findByOwnerIdOrMemberIdAndDeleted(userId: Int, deleted: Boolean): List<SqlPlaygroundDatabase>
    fun findByOwner_IdAndIdAndDeleted(ownerId: Int, id: Int, deleted: Boolean): SqlPlaygroundDatabase?

    @Query(
        "select * from sql_playground_database d left join sql_users u on d.id = u.db_id where d.id = :dbId and d.deleted = :deleted and (d.owner_user_id = :userId or u.user_user_id = :userId)",
        nativeQuery = true
    )
    fun findByOwnerIdOrMemberIdAndIdAndDeleted(userId: Int, dbId: Int, deleted: Boolean): SqlPlaygroundDatabase?
    fun findByOwner_IdAndActiveAndDeleted(ownerId: Int, active: Boolean, deleted: Boolean): SqlPlaygroundDatabase?
}
