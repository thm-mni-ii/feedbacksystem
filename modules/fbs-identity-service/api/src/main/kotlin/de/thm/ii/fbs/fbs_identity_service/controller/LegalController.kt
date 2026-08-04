package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.auth.CurrentUserService
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.springframework.core.io.ClassPathResource
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/legal")
class LegalController(private val userService: UserService, private val currentUserService: CurrentUserService) {

    @GetMapping("/{filename}")
    fun legalTexts(@PathVariable filename: String): Map<String, String> {
        val resourceName = when (filename) {
            "impressum" -> "impressum.md"
            "privacy-text" -> "privacy_text.md"
            else -> throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        val text = ClassPathResource(resourceName)
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        return mapOf("markdown" to text)
    }

    @GetMapping("/termsofuse/{uid}")
    fun getTermsOfUseAcceptanceStatus(@PathVariable uid: Long): Map<String, Boolean> {
        val user = requireCurrentUser(uid)

        return mapOf("accepted" to userService.getPrivacyStatusOf(user.id))
    }

    @PutMapping("/termsofuse/{uid}")
    fun acceptTermsOfUse(@PathVariable uid: Long) {
        val user = requireCurrentUser(uid)
        userService.updateAgreementToPrivacyFor(user.id, true)
    }

    private fun requireCurrentUser(uid: Long): User {
        val user = currentUserService.getCurrentUser()
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        if (user.id != uid) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return user
    }
}