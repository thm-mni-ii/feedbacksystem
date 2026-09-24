package de.thm.ii.fbs.fbs_identity_service.dto.app

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateApplicationProviderRequest(
    @field:NotBlank
    @field:Size(max = 255)
    val title: String,

    val description: String? = null,

    @field:NotBlank
    @field:Size(max = 64)
    val icon: String,

    @field:NotBlank
    @field:Size(max = 512)
    val url: String,

    val embedMode: EmbedMode = EmbedMode.IFRAME,

    val requiredGlobalRole: AppRequiredRole = AppRequiredRole.ALL,

    val navbarPosition: Int = 100,

    val showInNavbar: Boolean = true,

    val isDefault: Boolean = false,

    val isActive: Boolean = true,

    @field:Size(max = 128)
    val clientId: String? = null
)
