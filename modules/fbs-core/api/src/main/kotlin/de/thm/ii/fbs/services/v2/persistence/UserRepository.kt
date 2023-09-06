package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.security.authentication.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import javax.transaction.Transactional

interface UserRepository : JpaRepository<User, Int> {
    fun findByUsername(username: String): User?

    fun findAllByDeleted(deleted: Boolean = false): List<User>

    @Transactional
    @Modifying
    @Query("update User u set u.password = :password where u.id = :id")
    fun updatePasswordById(id: Int, password: String?): Int

    @Transactional
    @Modifying
    @Query("update User u set u.globalRoleInt = :globalRoleInt where u.id = :id")
    fun updateGlobalRoleIntById(id: Int, globalRoleInt: Int): Int

    @Transactional
    @Modifying
    @Query("update User u set u.privacyChecked = :privacyChecked where u.id = :id")
    fun updatePrivacyCheckedById(id: Int, privacyChecked: Boolean): Int

    @Transactional
    @Modifying
    @Query("update User u set u.deleted = true where u.id = :id")
    fun updateDeletedById(id: Int): Int
}
