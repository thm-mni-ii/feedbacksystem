package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.SQLConstraint
import de.thm.ii.fbs.model.v2.playground.SQLTable
import org.springframework.data.jpa.repository.JpaRepository

interface SQLConstraintRepository : JpaRepository<SQLConstraint, Int> {
    fun findByTable_Database_OwnerAndTable_Database_IdAndTable_Id(owner: User, databaseId: Int, tableId: Int): List<SQLConstraint>;
}
