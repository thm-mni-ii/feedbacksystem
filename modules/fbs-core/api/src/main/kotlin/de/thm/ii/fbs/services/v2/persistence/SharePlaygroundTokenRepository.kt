package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.security.SharePlaygroundToken
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface SharePlaygroundTokenRepository : JpaRepository<SharePlaygroundToken, String> {
    fun findAllByExpiryTimeBefore(now: LocalDateTime?): List<SharePlaygroundToken>
}