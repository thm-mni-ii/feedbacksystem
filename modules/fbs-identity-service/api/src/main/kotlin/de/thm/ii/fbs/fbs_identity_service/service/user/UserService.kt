package de.thm.ii.fbs.fbs_identity_service.service.user

import de.thm.ii.fbs.fbs_identity_service.exception.InvalidCurrentPasswordException
import de.thm.ii.fbs.fbs_identity_service.exception.PasswordMismatchException
import de.thm.ii.fbs.fbs_identity_service.exception.UserNotFoundException
import de.thm.ii.fbs.fbs_identity_service.exception.UsernameAlreadyExistsException
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import org.springframework.dao.DataIntegrityViolationException
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

    fun findUsers(
        query: String?,
        globalRole: GlobalRole?,
        limit: Int?,
        offset: Int?
    ): UserSearchResult {

        val normalizedQuery = query
            ?.takeIf { it.isNotBlank() }

        val totalCount = userRepository.countUsers(
            query = normalizedQuery,
            globalRole = globalRole?.id
        )

        val safeOffset = offset ?: 0
        val safeLimit = limit ?: totalCount.toInt()

        val items = userRepository.searchUsers(
            query = normalizedQuery,
            globalRole = globalRole?.id,
            limit = safeLimit,
            offset = safeOffset
        ).map { it.toModel() }

        return UserSearchResult(
            items = items,
            totalCount = totalCount.toInt()
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
        requireUsernameAvailable(username)

        val userEntity = UserEntity(
            prename = prename,
            surname = surname,
            email = email,
            username = username,
            password = passwordEncoder.encode(password),
            globalRole = globalRole?.id ?: GlobalRole.USER.id,
            alias = alias
        )

        val savedUserEntity = saveUser(userEntity)

        return savedUserEntity
    }

    fun createExternalUser(
        prename: String,
        surname: String,
        email: String,
        username: String,
        globalRole: GlobalRole = GlobalRole.USER,
        alias: String? = null
    ): User {
        requireUsernameAvailable(username)

        val userEntity = UserEntity(
            prename = prename,
            surname = surname,
            email = email,
            username = username,
            password = null,
            globalRole = globalRole.id,
            alias = alias
        )

        val savedUserEntity = saveUser(userEntity)

        return savedUserEntity
    }

    fun updateUser(
        userId: Long,
        prename: String,
        surname: String,
        email: String,
        alias: String?
    ): User {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId)
            ?: throw UserNotFoundException(userId)

        require(prename.isNotBlank()) { "Prename must not be blank" }
        require(surname.isNotBlank()) { "Surname must not be blank" }
        require(email.isNotBlank()) { "Email must not be blank" }

        userEntity.prename = prename.trim()
        userEntity.surname = surname.trim()
        userEntity.email = email.trim()
        userEntity.alias = alias?.trim()?.ifBlank { null }

        val savedEntity = userRepository.save(userEntity)
        return savedEntity.toModel()
    }

    private fun requireUsernameAvailable(username: String) {
        if (userRepository.existsByUsername(username)) {
            throw UsernameAlreadyExistsException(username)
        }
    }

    private fun saveUser(userEntity: UserEntity): User {
        return try {
            userRepository.saveAndFlush(userEntity).toModel()
        } catch (_: DataIntegrityViolationException) {
            // Der Username ist aktuell das einzige vom Nutzer gesetzte eindeutige Datenbankfeld.
            throw UsernameAlreadyExistsException(userEntity.username)
        }
    }

    fun updateGlobalRole(userId: Long, globalRole: GlobalRole): User? {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return null
        userEntity.globalRole = globalRole.id
        val savedUserEntity = userRepository.save(userEntity)

        return savedUserEntity.toModel()
    }

    fun deactivateUser(userId: Long): Boolean {
        val userEntity = userRepository.findByIdAndDeletedFalse(userId) ?: return false

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
        val currentUser = currentUserService.getCurrentUser() ?: throw UserNotFoundException(0)

        val userEntity = userRepository.findById(currentUser.id).orElseThrow { UserNotFoundException(currentUser.id) }

        val storedPassword = userEntity.password ?: throw InvalidCurrentPasswordException()

        if (!passwordEncoder.matches(currentPassword, storedPassword)) {
            throw InvalidCurrentPasswordException()
        }

        if (newPassword != newPasswordRepeat) {
            throw PasswordMismatchException()
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
        val currentUser = currentUserService.getCurrentUser() ?: throw UserNotFoundException(0)

        if (currentUser.globalRole != GlobalRole.ADMIN) {
            return false
        }

        if (newPassword != newPasswordRepeat) {
            throw PasswordMismatchException()
        }

        val targetUser = userRepository.findByIdAndDeletedFalse(userId) ?: throw UserNotFoundException(userId)

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
