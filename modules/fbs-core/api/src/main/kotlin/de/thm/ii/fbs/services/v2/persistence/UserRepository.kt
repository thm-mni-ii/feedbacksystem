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
    @Query("""
        UPDATE User u 
        SET u.username = CONCAT('duser ', u.id), 
            u.prename = 'Deleted User', 
            u.surname = 'Deleted User', 
            u.email = '',
            u.lastLogin = null 
        WHERE u.lastLogin < :cutoffDate
    """)
    fun anonymizeInactiveUsers(@Param("cutoffDate") cutoffDate: LocalDateTime): Int

    @Modifying
    @Transactional
    @Query("""
        UPDATE User u 
        SET u.lastLogin = :now
        WHERE u.id = :id
    """)
    fun updateLastLogin(@Param("id") id: Int, @Param("now") now: LocalDateTime): Int

    fun findByLastLoginBefore(cutoffDate: LocalDateTime): List<User>

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_course WHERE user_id = :userId", nativeQuery = true)
    fun deleteUserCourseEntries(@Param("userId") userId: Int)
}