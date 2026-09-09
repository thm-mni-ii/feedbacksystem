package de.thm.ii.fbs.services.v2.security

import de.thm.ii.fbs.model.v2.security.User
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class CurrentUserResolver(
    private val userRepository: UserRepository
) {
    fun resolveCurrentUserId(): Int? {
        val authentication = SecurityContextHolder.getContext().authentication
        val jwt = authentication?.principal as? Jwt ?: return null
        return jwt.subject.toIntOrNull()
    }

    fun resolveCurrentUser(): User? {
        val userId = resolveCurrentUserId() ?: return null
        return userRepository.findById(userId).orElse(null)
    }
}
