package de.thm.ii.fbs.fbs_identity_service.service.auth.saml

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.auth.JwtService
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class SamlLoginService(
    private val userService: UserService,
    private val jwtService: JwtService
) {

    fun login(samlUser: SamlUser): LoginResponse {
        val username = samlUser.username.trim()

        if (username.isBlank()) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing SAML username")
        }

        val user = userService.findActive(username)
            ?: createUserFromSaml(samlUser.copy(username = username))

        val token = jwtService.createToken(user)

        return LoginResponse(
            accessToken = token,
            tokenType = "Bearer",
            expiresIn = jwtService.getExpiresIn()
        )
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