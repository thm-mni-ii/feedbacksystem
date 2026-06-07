package de.thm.ii.fbs.fbs_identity_service.service

import de.thm.ii.fbs.fbs_identity_service.model.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService (private val userRepository: UserRepository, private val passwordEncoder: PasswordEncoder) {

    // Übergangslösung. Später soll der aktuell authentifizierte/eingeloggte Nutzer zurückgegeben werden
    fun getCurrentUser(): User? {
        return userRepository.findByUsername("admin")?.toModel()
    }

    fun findUserById(id: Long): User? {
        return userRepository.findById(id).orElse(null).toModel()
    }

    fun findUsers(query: String?, globalRole: GlobalRole?, limit: Int?, offset: Int?): UserSearchResult {
        var result = userRepository.findByDeletedFalse()
            .map { it.toModel() }

        if (!query.isNullOrBlank()) {
            result = result.filter {
                it.username.contains(query, ignoreCase = true) ||
                        it.prename.contains(query, ignoreCase = true) ||
                        it.surname.contains(query, ignoreCase = true) ||
                        it.email.contains(query, ignoreCase = true) ||
                        it.alias?.contains(query, ignoreCase = true) == true
            }
        }

        if (globalRole != null) {
            result = result.filter { it.globalRole == globalRole }
        }

        val totalCount = result.size
        val safeOffset = offset ?: 0
        val safeLimit = limit ?: result.size

        val pagedItems = result
            .drop(safeOffset)
            .take(safeLimit)

        return UserSearchResult(
            items = pagedItems,
            totalCount = totalCount
        )
    }

    fun createUser(
        prename: String,
        surname: String,
        email: String,
        username: String,
        password: String,
        globalRole: GlobalRole?,
        alias: String?
    ): User {
        val userEntity = UserEntity(
            prename = prename,
            surname = surname,
            email = email,
            username = username,
            password = passwordEncoder.encode(password),
            globalRole = globalRole?.id ?: GlobalRole.USER.id,
            alias = alias
        )

        val savedUserEntity = userRepository.save(userEntity)

        return savedUserEntity.toModel()
    }

    fun updateGlobalRole(userId: Long, globalRole: GlobalRole): User? {
        val userEntity = userRepository.findById(userId).orElse(null) ?: return null
        userEntity.globalRole = globalRole.id
        val savedUserEntity = userRepository.save(userEntity)

        return savedUserEntity.toModel()
    }

    fun deactivateUser(userId: Long): Boolean {
        val userEntity = userRepository.findById(userId).orElse(null) ?: return false

        userRepository.deleteUserCourseAssignments(userId)

        userEntity.prename = "Deleted User"
        userEntity.surname = "Deleted User"
        userEntity.email = ""
        userEntity.username = "duser $userId"
        userRepository.save(userEntity)

        return true
    }

    // Später muss hier der authentifizierte Nutzer geprüft werden und aktueller Passwort-Hash geprüft werden
    fun changeOwnPassword(
        currentPassword: String,
        newPassword: String,
        newPasswordRepeat: String
    ): Boolean {

        return currentPassword.isNotBlank() &&
                newPassword.isNotBlank() &&
                newPassword == newPasswordRepeat
    }

    // Übergangslösung: Im alten FBS darf ein ADMIN fremde Passwörter ändern; normale Nutzer nur ihr eigenes.
    fun changeUserPassword(
        userId: Long,
        newPassword: String,
        newPasswordRepeat: String
    ): Boolean {
        if (newPassword.isBlank() || newPassword != newPasswordRepeat) {
            return false
        }

        val userEntity = userRepository.findById(userId).orElse(null) ?: return false
        userEntity.password = passwordEncoder.encode(newPassword)
        userRepository.save(userEntity)

        return true
    }

    fun updateAgreementToPrivacyFor(userId: Long, agreed: Boolean): Boolean {
        val userEntity = userRepository.findById(userId).orElse(null) ?: return false
        userEntity.privacyChecked = agreed
        userRepository.save(userEntity)

        return true
    }

    fun getPrivacyStatusOf(userId: Long): Boolean {
        val userEntity = userRepository.findById(userId).orElse(null) ?: return false

        return userEntity.privacyChecked
    }
}