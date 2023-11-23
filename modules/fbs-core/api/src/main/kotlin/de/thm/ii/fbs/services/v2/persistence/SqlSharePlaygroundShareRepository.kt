package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundShare
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface SqlSharePlaygroundShareRepository : JpaRepository<SqlPlaygroundShare, String> {
    fun findAllByCreationTimeLessThan(creationTime: LocalDateTime): List<SqlPlaygroundShare>
}
