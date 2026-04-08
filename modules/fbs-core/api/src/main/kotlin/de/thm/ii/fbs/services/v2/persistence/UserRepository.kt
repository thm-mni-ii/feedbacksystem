package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.security.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
interface UserRepository : JpaRepository<User, Int> {
    fun findByUsername(username: String): User?

    @Modifying
    @Transactional
    @Query(
        value = """
        UPDATE `user` u
        SET u.username = CONCAT('duser ', u.user_id),
            u.prename = 'Deleted User',
            u.surname = 'Deleted User',
            u.email = '',
            u.password = NULL,
            u.alias = NULL,
            u.deleted = 1,
            u.last_login = NULL
        WHERE u.deleted = 0
            AND u.last_login IS NOT NULL
            AND u.last_login < :cutoffDate
        """,
        nativeQuery = true
    )
    fun anonymizeInactiveUsers(@Param("cutoffDate") cutoffDate: LocalDateTime): Int

    @Modifying
    @Transactional
    @Query(
        """
        UPDATE User u
        SET u.lastLogin = :now
        WHERE u.id = :id
        """
    )
    fun updateLastLogin(
        @Param("id") id: Int,
        @Param("now") now: LocalDateTime
    ): Int

    @Query(
        value = """
        SELECT u.user_id, u.username, u.last_login
        FROM `user` u
        WHERE u.deleted = 0
            AND u.last_login IS NOT NULL
            AND u.last_login < :cutoffDate
        """,
        nativeQuery = true
    )
    fun findUsersToAnonymize(@Param("cutoffDate") cutoffDate: LocalDateTime): List<User>
}