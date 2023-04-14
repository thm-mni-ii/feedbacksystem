package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundUsers
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SqlPlaygroundUsersRepository : JpaRepository<SqlPlaygroundUsers, Int> {
    //@Query(value = "SELECT db FROM fbs.", nativeQuery = true)
    fun findAllSqlPlaygroundDatabasesByUserId(userId: Int): List<SqlPlaygroundDatabase>
    fun findSqlPlaygroundDatabasesByMemberIdAndDBId(memberId: Int, dbId: Int): SqlPlaygroundDatabase?
}