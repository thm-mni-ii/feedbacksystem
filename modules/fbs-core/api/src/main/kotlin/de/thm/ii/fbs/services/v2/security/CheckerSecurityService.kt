package de.thm.ii.fbs.services.v2.security

import de.thm.ii.fbs.common.types.checkerApi.Checker
import de.thm.ii.fbs.controller.v2.exceptions.UnauthorizedException
import de.thm.ii.fbs.services.v2.persistence.TokenRepository
import org.springframework.stereotype.Service

@Service
class CheckerSecurityService(
    private val tokenRepository: TokenRepository,
    private val tokenService: HashTokenService,
) {
    fun validateAuthorization(authorization: String) =
        authorization.split(" ", limit = 2).let {(_, token) -> validateToken(token)}

    private fun validateToken(token: String): Checker =
        checkToken(token) ?: throw UnauthorizedException("invalid checker token")

    private fun checkToken(token: String): Checker? {
        val hashed = tokenService.hash(token)
        val tokenObj = tokenRepository.findByToken(hashed) ?: return null
        return tokenObj.checker
    }
}
