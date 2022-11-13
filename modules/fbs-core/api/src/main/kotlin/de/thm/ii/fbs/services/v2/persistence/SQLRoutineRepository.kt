package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SQLRoutine
import org.springframework.data.jpa.repository.JpaRepository

interface SQLRoutineRepository : JpaRepository<SQLRoutine, Int> {
    fun findByDatabase_Owner_IdAndDatabase_Id(ownerId: Int, databaseId: Int): List<SQLRoutine>;
}
