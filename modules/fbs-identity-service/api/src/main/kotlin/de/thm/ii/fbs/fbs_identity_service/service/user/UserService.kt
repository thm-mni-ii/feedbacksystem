package de.thm.ii.fbs.fbs_identity_service.service.user

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import de.thm.ii.fbs.fbs_identity_service.service.auth.CurrentUserService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService (private val userRepository: UserRepository, private val passwordEncoder: PasswordEncoder, private val currentUserService: CurrentUserService) {


    fun getCurrentUser(): User? {
        return currentUserService.getCurrentUser()
    }

    fun findUserById(id: Long): User? {
        return userRepository.findByIdAndDeletedFalse(id)?.toModel()
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

    fun findActive(username: String): User? {
        return userRepository.findByUsername(username)
            ?.takeIf { !it.deleted }
            ?.toModel()
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

    fun createExternalUser(
        prename: String,
        surname: String,
        email: String,
        username: String,
        globalRole: GlobalRole = GlobalRole.USER,
        alias: String? = null
    ): User {
        val userEntity = UserEntity(
            prename = prename,
            surname = surname,
            email = email,
            username = username,
            password = null,
            globalRole = globalRole.id,
            alias = alias
        )

        val savedUserEntity = userRepository.save(userEntity)

        return savedUserEntity.toModel()
    }

    fun updateGlobalRole(userId: Long, globalRole: GlobalRole): User? {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return null
        userEntity.globalRole = globalRole.id
        val savedUserEntity = userRepository.save(userEntity)

        return savedUserEntity.toModel()
    }
    @Transactional
    fun deactivateUser(userId: Long): Boolean {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return false

        userRepository.deleteUserCourseAssignments(userId)

        userEntity.prename = "Deleted User"
        userEntity.surname = "Deleted User"
        userEntity.email = ""
        userEntity.username = "duser $userId"
        userEntity.deleted = true
        userEntity.password = null
        userEntity.globalRole = GlobalRole.USER.id
        userEntity.alias = null
        userRepository.save(userEntity)

        return true
    }

    fun changeOwnPassword(
        currentPassword: String,
        newPassword: String,
        newPasswordRepeat: String
    ): Boolean {
        val currentUser = currentUserService.getCurrentUser() ?: return false

        val userEntity = userRepository.findById(currentUser.id).orElse(null) ?: return false

        val storedPassword = userEntity.password ?: return false

        if (
            !passwordEncoder.matches(currentPassword, storedPassword) ||
            newPassword.isBlank() ||
            newPassword != newPasswordRepeat
        ) {
            return false
        }

        userEntity.password = passwordEncoder.encode(newPassword)
        userRepository.save(userEntity)

        return true
    }

    fun changeUserPassword(
        userId: Long,
        newPassword: String,
        newPasswordRepeat: String
    ): Boolean {
        val currentUser = currentUserService.getCurrentUser() ?: return false

        if (
            currentUser.globalRole != GlobalRole.ADMIN
            || newPassword.isBlank()
            || newPassword != newPasswordRepeat
        ){
            return false
        }

        val targetUser = userRepository.findByIdAndDeletedFalse(userId) ?: return false

        targetUser.password = passwordEncoder.encode(newPassword)
        userRepository.save(targetUser)

        return true
    }

    fun updateAgreementToPrivacyFor(userId: Long, agreed: Boolean): Boolean {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return false
        userEntity.privacyChecked = agreed
        userRepository.save(userEntity)

        return true
    }

    fun getPrivacyStatusOf(userId: Long): Boolean {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return false

        return userEntity.privacyChecked
    }
}