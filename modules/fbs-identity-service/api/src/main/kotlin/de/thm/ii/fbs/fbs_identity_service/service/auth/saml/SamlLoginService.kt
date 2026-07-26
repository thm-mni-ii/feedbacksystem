package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import de.thm.ii.fbs.fbs_identity_service.exception.MissingSamlUsernameException
import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.springframework.stereotype.Service

@Service
class SamlLoginService(
    private val userService: UserService
) {

    fun resolveUser(samlUser: SamlUser): User {
        val username = samlUser.username.trim()

        if (username.isBlank()) {
            throw MissingSamlUsernameException()
        }

        return userService.findActive(username)
            ?: createUserFromSaml(samlUser.copy(username = username))
    }

    private fun createUserFromSaml(samlUser: SamlUser): User {
        return userService.createExternalUser(
            prename = samlUser.prename,
            surname = samlUser.surname,
            email = samlUser.email,
            username = samlUser.username,
            globalRole = GlobalRole.USER,
            alias = null
        )
    }
}
