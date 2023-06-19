@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.security.authentication

import de.thm.ii.fbs.model.v2.course.Participant
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import javax.persistence.*

/**
 * User object
 * @param prename User's prename
 * @param surname User's surname
 * @param username User's username
 * @param globalRole User's global role
 * @param email User's email
 * @param alias the DB password hash
 * @param id local DB's userid
 */
@Entity
@Table(name = "user")
class User(
    @Column(nullable = false)
    val prename: String,
    @Column(nullable = false)
    val surname: String,
    @Column(nullable = false)
    var username: String,
    @Column(nullable = false)
    val globalRole: GlobalRole,
    @Column
    val email: String? = null,
    @Column
    val alias: String? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var id: Int? = null
) {

    fun toUserDetails(): UserDetails = User(username, null, setOf(globalRole)) // TODO save password in user?

    fun hasRole(role: GlobalRole, vararg roles: GlobalRole): Boolean = globalRole == role || roles.contains(globalRole) // TODO remove once authorization is moved to spring security

    override fun equals(other: Any?): Boolean = when (other) {
        is User -> username == other.username
        is Participant -> username == other.user.username
        else -> false
    }

    override fun hashCode(): Int = username.hashCode()
}
