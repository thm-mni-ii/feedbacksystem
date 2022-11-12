package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.SQLTable
import org.springframework.data.jpa.repository.JpaRepository

interface SQLTableRepository : JpaRepository<SQLTable, Int> {
    fun findByDatabase_OwnerAndDatabase_Id(owner: User, databaseId: Int): List<SQLTable>;
    fun findByDatabase_OwnerAndDatabase_IdAndId(owner: User, databaseId: Int, id: Int): SQLTable?;
}
