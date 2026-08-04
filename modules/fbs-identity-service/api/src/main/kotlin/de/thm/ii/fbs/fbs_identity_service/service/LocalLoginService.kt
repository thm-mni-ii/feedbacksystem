package de.thm.ii.fbs.fbs_identity_service.service

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class LocalLoginService (
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
){

    fun login(username: String, password: String): LoginResponse {

        val user = userRepository.findByUsernameAndDeletedFalse(username)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        val storedPassword = user.password
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        if (!passwordEncoder.matches(password, storedPassword)){
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }

        val token = jwtService.createToken(user.toModel())

        return LoginResponse(
            accessToken = token,
            expiresIn = jwtService.getExpiresIn()
            )
    }
}