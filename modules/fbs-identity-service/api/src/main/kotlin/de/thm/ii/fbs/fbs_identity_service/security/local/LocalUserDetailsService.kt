package de.thm.ii.fbs.fbs_identity_service.security.local

import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class LocalUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsernameAndDeletedFalse(username)
            ?: throw UsernameNotFoundException("User not found")

        val password = user.password
            ?: throw UsernameNotFoundException("User not found")

        val role = user.toModel().globalRole

        return LocalUserPrincipal(
            userId = user.id,
            username = user.username,
            password = password,
            globalRole = role,
            authorities = listOf(
                SimpleGrantedAuthority("ROLE_${role.name}")
            )
        )
    }
}
