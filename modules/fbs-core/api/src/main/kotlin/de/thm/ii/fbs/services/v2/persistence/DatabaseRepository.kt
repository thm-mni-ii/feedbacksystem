package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.Database
import org.springframework.data.jpa.repository.JpaRepository

interface DatabaseRepository : JpaRepository<Database, Int> {
    fun findByOwner(owner: User): List<Database>
    fun findByOwnerAndId(owner: User, id: Int): Database?
    fun findByOwnerAndActive(owner: User, active: Boolean): Database?
}
