package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.security.User
import org.springframework.data.jpa.repository.JpaRepository

interface GroupRepository : JpaRepository<Group, Int> {
    fun findAllByMembersContaining(user: User): List<Group>
    fun findByKey(key: String): Group?
    fun findByIdAndCreator(id: Int, creator: User): Group?
}
