package de.thm.ii.fbs.fbs_identity_service.persistence.mapper

import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity

fun ApplicationProviderEntity.toModel(): ApplicationProvider {
    val parsedRedirectUris = redirectUris?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
    val parsedPostLogoutUris = postLogoutRedirectUris?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
    val parsedScopes = scopes.split(",").map { it.trim() }.filter { it.isNotEmpty() }

    return ApplicationProvider(
        id = id,
        title = title,
        description = description,
        icon = icon,
        url = url,
        embedMode = embedMode,
        requiredGlobalRole = requiredGlobalRole,
        navbarPosition = navbarPosition,
        showInNavbar = showInNavbar,
        isDefault = isDefault,
        isActive = isActive,
        clientId = clientId,
        oidcEnabled = oidcEnabled,
        redirectUris = parsedRedirectUris,
        postLogoutRedirectUris = parsedPostLogoutUris,
        clientType = clientType,
        scopes = parsedScopes.ifEmpty { listOf("openid", "profile", "email") },
        clientSecret = clientSecret,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
