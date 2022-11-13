package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SQLTable
import org.springframework.data.jpa.repository.JpaRepository

interface SQLTableRepository : JpaRepository<SQLTable, Int> {
    fun findByDatabase_Owner_IdAndDatabase_Id(ownerId: Int, databaseId: Int): List<SQLTable>;
    fun findByDatabase_Owner_IdAndDatabase_IdAndId(ownerId: Int, databaseId: Int, id: Int): SQLTable?;
}
