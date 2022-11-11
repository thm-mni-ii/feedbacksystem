package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.ac.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Int> {
    fun findByUsername(username: String): User?
}
