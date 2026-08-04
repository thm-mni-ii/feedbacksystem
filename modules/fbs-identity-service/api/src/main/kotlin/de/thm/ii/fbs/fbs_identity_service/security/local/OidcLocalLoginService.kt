package de.thm.ii.fbs.fbs_identity_service.security.local

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
class OidcLocalLoginService(
    private val authenticationManager: AuthenticationManager
) {

    fun authenticate(
        username: String,
        password: String
    ): Authentication {
        return authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(
                username,
                password
            )
        )
    }
}
