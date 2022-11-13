package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SQLConstraint
import org.springframework.data.jpa.repository.JpaRepository

interface SQLConstraintRepository : JpaRepository<SQLConstraint, Int> {
    fun findByTable_Database_Owner_IdAndTable_Database_IdAndTable_Id(ownerId: Int, databaseId: Int, tableId: Int): List<SQLConstraint>;
}
