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
            ?: (jwt.getClaim<Any>("id") as? Number)?.toInt()
            ?: (jwt.getClaim<Any>("userId") as? Number)?.toInt()
            ?: jwt.getClaim<String>("id")?.toIntOrNull()
            ?: jwt.getClaim<String>("userId")?.toIntOrNull()
            ?: (jwt.getClaimAsString("preferred_username") ?: jwt.getClaimAsString("username") ?: jwt.subject)?.let { username ->
                userRepository.findByUsername(username)?.id
            }
    }

    fun resolveCurrentUser(): User? {
        val userId = resolveCurrentUserId() ?: return null
        return userRepository.findById(userId).orElse(null)
    }
}
