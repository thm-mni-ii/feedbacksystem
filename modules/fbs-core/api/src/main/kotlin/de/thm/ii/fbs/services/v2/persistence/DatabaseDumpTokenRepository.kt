package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.security.DatabaseDumpToken
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface DatabaseDumpTokenRepository : JpaRepository<DatabaseDumpToken, String> {
    fun findAllByExpiryTimeBefore(now: LocalDateTime?): List<DatabaseDumpToken>
}