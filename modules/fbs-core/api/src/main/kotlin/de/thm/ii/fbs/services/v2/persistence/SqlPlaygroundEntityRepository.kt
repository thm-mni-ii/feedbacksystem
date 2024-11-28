package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SqlPlaygroundEntityRepository : JpaRepository<SqlPlaygroundEntity, Int> {
    fun findByDatabase_Owner_IdAndDatabase_idAndDatabase_DeletedAndType(
        ownerId: Int,
        databaseId: Int,
        deleted: Boolean,
        type: String
    ): SqlPlaygroundEntity?

    @Query(
        "select * from sql_playground_entity e join sql_playground_database d on e.db = d.id left join sql_users u on d.id = u.db_id where d.id = :databaseId and d.deleted = :deleted and e.type = :type and (d.owner = :ownerId or u.user_user_id = :userId)",
        nativeQuery = true
    )
    fun findByDatabaseOwnerOrMemberAndDatabaseIdAndDatabaseDeletedAndType(
        ownerId: Int,
        databaseId: Int,
        deleted: Boolean,
        type: String
    ): SqlPlaygroundEntity?
}
