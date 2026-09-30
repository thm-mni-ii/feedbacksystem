package de.thm.ii.fbs.fbs_identity_service.dto.app

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class CreateApplicationProviderRequest(
    @field:NotBlank(message = "ID is required")
    @field:Size(min = 1, max = 64, message = "ID must be between 1 and 64 characters")
    @field:Pattern(
        regexp = "^[a-zA-Z0-9_-]+$",
        message = "ID must contain only alphanumeric characters, dashes, and underscores"
    )
    val id: String,

    @field:NotBlank(message = "Title is required")
    @field:Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    val title: String,

    val description: String? = null,

    @field:NotBlank(message = "Icon is required")
    @field:Size(min = 1, max = 64, message = "Icon must be between 1 and 64 characters")
    val icon: String,

    @field:NotBlank(message = "URL is required")
    @field:Size(min = 1, max = 512, message = "URL must be between 1 and 512 characters")
    val url: String,

    val embedMode: EmbedMode = EmbedMode.IFRAME,
    val requiredGlobalRole: AppRequiredRole = AppRequiredRole.ALL,
    val navbarPosition: Int = 100,
    val showInNavbar: Boolean = true,
    val isDefault: Boolean = false,
    val isActive: Boolean = true,
    val isInternal: Boolean = false,
    val clientId: String? = null,
    val oidcEnabled: Boolean? = null,
    val redirectUris: List<String>? = null,
    val postLogoutRedirectUris: List<String>? = null,
    val clientType: String? = null,
    val scopes: List<String>? = null,
    val clientSecret: String? = null
)
