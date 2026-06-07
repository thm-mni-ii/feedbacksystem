package de.thm.ii.fbs.fbs_identity_service.controller

import org.springframework.core.io.ClassPathResource
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/legal")
class LegalController {

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

    // Terms-of-use-Endpunkte erst aktivieren, wenn der aktuelle Nutzer über Auth/SecurityContext geprüft werden kann
    // Sonst könnte ein Client den Privacy-Status beliebiger Nutzer lesen oder setzen.

    /*
    @GetMapping("/termsofuse/{uid}")
    fun getTermsOfUseAcceptanceStatus(@PathVariable uid: Long): Map<String, Boolean> {
        return mapOf("accepted" to userService.getPrivacyStatusOf(uid))
    }

    @PutMapping("/termsofuse/{uid}")
    fun acceptTermsOfUse(@PathVariable uid: Long) {
        userService.updateAgreementToPrivacyFor(uid, true)
    }
    */
}