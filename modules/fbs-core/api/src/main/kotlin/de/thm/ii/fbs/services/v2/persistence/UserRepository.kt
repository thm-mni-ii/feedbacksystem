package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.security.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Int> {
    fun findByUsername(username: String): User?
    fun updateUserPassword(userid: Int, pass: String): User
    fun updateUserGlobalRole(userid: Int, globalRole: GlobalRole)
}
