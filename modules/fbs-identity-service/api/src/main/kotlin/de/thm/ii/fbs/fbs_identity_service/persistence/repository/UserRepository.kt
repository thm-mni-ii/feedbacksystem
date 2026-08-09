package de.thm.ii.fbs.fbs_identity_service.persistence.repository

import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface UserRepository: JpaRepository <UserEntity, Long> {

    fun findByUsername(username: String): UserEntity?

    fun existsByUsername(username: String): Boolean

    fun findByDeletedFalse(): List<UserEntity>

    // Übergangslösung, solange Kurszuordnungen noch in der bestehenden FBS-Datenbank liegen.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_course WHERE user_id = :userId", nativeQuery = true)
    fun deleteUserCourseAssignments(userId: Long): Int

    fun findByUsernameAndDeletedFalse(username: String): UserEntity?

    fun findByIdAndDeletedFalse(id: Long): UserEntity?

    @Query(
        value = """
            SELECT *
            FROM user
            WHERE deleted = false
              AND (
                  :query IS NULL
                  OR LOWER(username) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(prename) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(surname) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(email) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(alias) LIKE LOWER(CONCAT('%', :query, '%'))
              )
              AND (
                  :globalRole IS NULL
                  OR global_role = :globalRole
              )
            ORDER BY user_id
            LIMIT :limit OFFSET :offset
        """,
        nativeQuery = true
    )
    fun searchUsers(
        query: String?,
        globalRole: Int?,
        limit: Int,
        offset: Int
    ): List<UserEntity>

    @Query(
        value = """
            SELECT COUNT(*)
            FROM user
            WHERE deleted = false
              AND (
                  :query IS NULL
                  OR LOWER(username) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(prename) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(surname) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(email) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(alias) LIKE LOWER(CONCAT('%', :query, '%'))
              )
              AND (
                  :globalRole IS NULL
                  OR global_role = :globalRole
              )
        """,
        nativeQuery = true
    )
    fun countUsers(
        query: String?,
        globalRole: Int?
    ): Long
}
