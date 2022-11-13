package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.Database
import org.springframework.data.jpa.repository.JpaRepository

interface DatabaseRepository : JpaRepository<Database, Int> {
    fun findByOwner_Id(ownerId: Int): List<Database>
    fun findByOwner_IdAndId(ownerId: Int, id: Int): Database?
    fun findByOwner_IdAndActive(ownerId: Int, active: Boolean): Database?
}
