package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundUsers
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface SqlPlaygroundUsersRepository : JpaRepository<SqlPlaygroundUsers, Int> {
    //@Query(value = "SELECT db_id FROM fbs.sql_users WHERE user_user_id = ?1", nativeQuery = true)
    fun findAllSqlPlaygroundDatabasesByUser_Id(userId: Int): List<SqlPlaygroundDatabase>
    @Query(value = "SELECT db FROM fbs.sql_users WHERE user_user_id = ?1 AND db_id = ?2", nativeQuery = true)
    fun findSqlPlaygroundDatabasesByMemberIdAndDBId(memberId: Int, dbId: Int): SqlPlaygroundDatabase?
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM fbs.sql_users WHERE user_user_id = ?1 AND db_id = ?2", nativeQuery = true)
    fun deleteByUserIdAndDBId(memberId: Int, dbId: Int)
}