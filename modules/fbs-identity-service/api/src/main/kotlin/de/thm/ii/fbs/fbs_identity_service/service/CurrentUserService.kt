package de.thm.ii.fbs.fbs_identity_service.service

import de.thm.ii.fbs.fbs_identity_service.model.User
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service

@Service
class CurrentUserService(
    private val userRepository: UserRepository
) {

    fun getCurrentUser(): User? {
        val jwt = SecurityContextHolder.getContext().authentication?.principal as? Jwt  ?: return null

        val userId = jwt.subject.toLongOrNull()  ?: return null

        val userEntity = userRepository.findByIdAndDeletedFalse(userId)?: return null

        return userEntity.toModel()
    }
}