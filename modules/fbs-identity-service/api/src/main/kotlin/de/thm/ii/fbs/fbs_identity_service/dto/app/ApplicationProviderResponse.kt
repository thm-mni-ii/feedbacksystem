package de.thm.ii.fbs.fbs_identity_service.dto.app

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import java.time.Instant

data class ApplicationProviderResponse(
    val id: String,
    val title: String,
    val description: String?,
    val icon: String,
    val url: String,
    val embedMode: EmbedMode,
    val requiredGlobalRole: AppRequiredRole,
    val navbarPosition: Int,
    val showInNavbar: Boolean,
    val isDefault: Boolean,
    val isActive: Boolean,
    val clientId: String?,
    val oidcEnabled: Boolean = false,
    val redirectUris: List<String> = emptyList(),
    val postLogoutRedirectUris: List<String> = emptyList(),
    val clientType: String = "PUBLIC",
    val scopes: List<String> = listOf("openid", "profile", "email"),
    val clientSecret: String? = null,
    val createdAt: Instant?,
    val updatedAt: Instant?
) {
    companion object {
        fun fromModel(model: ApplicationProvider): ApplicationProviderResponse {
            return ApplicationProviderResponse(
                id = model.id,
                title = model.title,
                description = model.description,
                icon = model.icon,
                url = model.url,
                embedMode = model.embedMode,
                requiredGlobalRole = model.requiredGlobalRole,
                navbarPosition = model.navbarPosition,
                showInNavbar = model.showInNavbar,
                isDefault = model.isDefault,
                isActive = model.isActive,
                clientId = model.clientId,
                oidcEnabled = model.oidcEnabled,
                redirectUris = model.redirectUris,
                postLogoutRedirectUris = model.postLogoutRedirectUris,
                clientType = model.clientType,
                scopes = model.scopes,
                clientSecret = model.clientSecret,
                createdAt = model.createdAt,
                updatedAt = model.updatedAt
            )
        }
    }
}
