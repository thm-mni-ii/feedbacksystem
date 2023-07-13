package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundUsers
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface SqlPlaygroundUsersRepository : JpaRepository<SqlPlaygroundUsers, Int> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM fbs.sql_users WHERE user_user_id = ?1 AND db_id = ?2", nativeQuery = true)
    fun deleteByUserIdAndDBId(memberId: Int, dbId: Int)
}
