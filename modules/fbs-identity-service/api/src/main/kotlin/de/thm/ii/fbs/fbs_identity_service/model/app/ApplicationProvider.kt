package de.thm.ii.fbs.fbs_identity_service.model.app

import java.time.Instant

data class ApplicationProvider(
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
    val isInternal: Boolean = false,
    val clientId: String?,
    val oidcEnabled: Boolean = false,
    val redirectUris: List<String> = emptyList(),
    val postLogoutRedirectUris: List<String> = emptyList(),
    val clientType: String = "PUBLIC",
    val scopes: List<String> = listOf("openid", "profile", "email"),
    val clientSecret: String? = null,
    val hasClientSecret: Boolean = !clientSecret.isNullOrBlank(),
    val createdAt: Instant? = null,
    val updatedAt: Instant? = null
)
