package de.thm.ii.fbs.fbs_identity_service.persistence.repository

import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface UserRepository: JpaRepository <UserEntity, Long> {

    fun findByUsername(username: String): UserEntity?

    fun findByDeletedFalse(): List<UserEntity>

    // Übergangslösung, solange Kurszuordnungen noch in der bestehenden FBS-Datenbank liegen.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_course WHERE user_id = :userId", nativeQuery = true)
    fun deleteUserCourseAssignments(userId: Long): Int

    fun findByUsernameAndDeletedFalse(username: String): UserEntity?

    fun findByIdAndDeletedFalse(id: Long): UserEntity?
}