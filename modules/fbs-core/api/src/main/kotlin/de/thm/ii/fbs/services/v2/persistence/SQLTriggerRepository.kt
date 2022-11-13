package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.SQLRoutine
import de.thm.ii.fbs.model.v2.playground.SQLTrigger
import de.thm.ii.fbs.model.v2.playground.SQLView
import org.springframework.data.jpa.repository.JpaRepository

interface SQLTriggerRepository : JpaRepository<SQLTrigger, Int> {
    fun findByDatabase_Owner_IdAndDatabase_Id(ownerId: Int, databaseId: Int): List<SQLTrigger>;
}
