package de.thm.ii.fbs.fbs_identity_service.service.auth

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.exception.InvalidCredentialsException
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class LocalLoginService (
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
){

    fun login(username: String, password: String): LoginResponse {

        val user = userRepository.findByUsernameAndDeletedFalse(username)
            ?: throw InvalidCredentialsException()

        val storedPassword = user.password
            ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(password, storedPassword)){
            throw InvalidCredentialsException()
        }

        val token = jwtService.createToken(user.toModel())

        return LoginResponse(
            accessToken = token,
            expiresIn = jwtService.getExpiresIn()
        )
    }
}
