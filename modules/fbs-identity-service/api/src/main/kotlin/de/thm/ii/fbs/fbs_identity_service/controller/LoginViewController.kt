package de.thm.ii.fbs.fbs_identity_service.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
class LoginViewController(
    @param:Value("\${app.saml.enabled:false}")
    private val samlEnabled: Boolean,

    @param:Value("\${app.saml.registration-id:keycloak}")
    private val samlRegistrationId: String
) {

    @GetMapping("/login")
    fun login(
        @RequestParam(value = "error", required = false) error: String?,
        @RequestParam(value = "ssoError", required = false) ssoError: String?,
        @RequestParam(value = "logout", required = false) logout: String?,
        model: Model
    ): String {
        model.addAttribute("samlEnabled", samlEnabled)
        model.addAttribute("samlLoginUrl", "/saml2/authenticate/$samlRegistrationId")
        model.addAttribute("hasError", error != null)
        model.addAttribute("hasSsoError", ssoError != null)
        model.addAttribute("hasLogout", logout != null)
        return "login"
    }

    @GetMapping("/legal/terms-of-use", "/legal/termsofuse")
    fun termsOfUse(
        @RequestParam(value = "redirect_uri", required = false) redirectUri: String?,
        model: Model
    ): String {
        val privacyText = try {
            ClassPathResource("privacy_text.md")
                .inputStream
                .bufferedReader()
                .use { it.readText() }
        } catch (e: Exception) {
            "Datenschutzbestimmungen"
        }
        model.addAttribute("privacyText", privacyText)
        model.addAttribute("redirectUri", redirectUri)
        return "terms-of-use"
    }
}
