package de.thm.ii.fbs.services.v2.security.authentication

import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import kotlin.jvm.optionals.getOrNull

@Component
class UserService(private val userRepository: UserRepository) : UserDetailsService {

    override fun loadUserByUsername(username: String?): UserDetails =
        username?.let { find(it) } ?: throw Exception() // TODO throw NotFoundException

    /**
     * Find the first user by username
     * @param username username
     * @return The found user
     */
    fun find(username: String): User? = userRepository.findByUsername(username)

    /**
     * Find the first user by id
     * @param id The users id
     * @return The found user
     */
    @OptIn(ExperimentalStdlibApi::class)
    fun find(id: Int): User? = userRepository.findById(id).getOrNull()

    /**
     * Get all stored users
     * @param ignoreDeleted Ignores deleted users
     * @return List of users
     */
    fun getAll(ignoreDeleted: Boolean = true): List<User> =
        if (ignoreDeleted) userRepository.findAllByDeleted() else userRepository.findAll()

    /**
     * Create a new user.
     * @param user The new user
     * @return The created user object
     */
    fun create(user: User): User = userRepository.save(user)

    /**
     * Update the password of the user with id
     * @param id The users id
     * @param password The new password
     * @return True if successfully updated
     */
    fun updatePasswordFor(id: Int, password: String? = null): Int = userRepository.updatePasswordById(id, password)

    /**
     * Update the global role of a user with id
     * @param id The users id
     * @param globalRole The new global role
     * @return True if successfully updated
     */
    fun updateGlobalRoleFor(id: Int, globalRole: GlobalRole): Int = userRepository.updateGlobalRoleIntById(id, globalRole.id)

    /**
     * Update the privacy check if the user.
     * The privacy check signal the users agreement to the privacy text of the software.
     * @param id The users id
     * @param agreed His agreement
     * @return True if successfully updated
     */
    fun updateAgreementToPrivacyFor(id: Int, agreed: Boolean): Int = userRepository.updatePrivacyCheckedById(id, agreed)

    /**
     * Get the user agreement for the systems privacy text.
     * @param id The user id
     * @return True if the user agreed to the privacy text, false in any other case.
     */
    @OptIn(ExperimentalStdlibApi::class)
    fun getPrivacyStatusOf(id: Int): Boolean = userRepository.findById(id).getOrNull()?.privacyChecked ?: false

    /**
     * Delete a user from the system, by replacing its personalized information with markers.
     * @param id The user id.
     * @return True if successfully updated
     */
    fun delete(id: Int): Int = userRepository.updateDeletedById(id)

    /**
     * Get the password for the user with the given username
     * @param username the username of the user to get the password for
     */
    fun getPassword(username: String): String? = userRepository.findByUsername(username)?.password
}
