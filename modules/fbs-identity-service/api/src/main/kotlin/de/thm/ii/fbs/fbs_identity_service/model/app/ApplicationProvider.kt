package de.thm.ii.fbs.fbs_identity_service.model.app

import java.time.Instant

data class ApplicationProvider(
    val id: String,
    val title: String,
    val description: String?,
    val icon: String,
    val url: String,
    val embedMode: EmbedMode = EmbedMode.IFRAME,
    val requiredGlobalRole: AppRequiredRole = AppRequiredRole.ALL,
    val navbarPosition: Int = 100,
    val showInNavbar: Boolean = true,
    val isDefault: Boolean = false,
    val isActive: Boolean = true,
    val clientId: String? = null,
    val createdAt: Instant? = null,
    val updatedAt: Instant? = null
)
