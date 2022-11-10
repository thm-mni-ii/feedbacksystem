package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.common.types.checkerApi.Token
import org.springframework.data.jpa.repository.JpaRepository

interface TokenRepository : JpaRepository<Token, Long> {
    fun findByToken(token: String): Token?
}
