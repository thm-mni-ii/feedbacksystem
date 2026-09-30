package de.thm.ii.fbs.fbs_identity_service.dto.app

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode

data class PublicApplicationProviderResponse(
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
    val isActive: Boolean
) {
    companion object {
        fun fromModel(model: ApplicationProvider): PublicApplicationProviderResponse {
            return PublicApplicationProviderResponse(
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
                isActive = model.isActive
            )
        }
    }
}
