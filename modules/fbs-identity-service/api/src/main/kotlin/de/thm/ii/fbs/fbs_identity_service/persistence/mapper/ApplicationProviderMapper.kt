package de.thm.ii.fbs.fbs_identity_service.persistence.mapper

import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList

fun ApplicationProviderEntity.toModel(): ApplicationProvider {
    val parsedRedirectUris = redirectUris.toCleanList()
    val parsedPostLogoutUris = postLogoutRedirectUris.toCleanList()
    val parsedScopes = scopes.toCleanList()

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
        isInternal = isInternal,
        clientId = clientId,
        oidcEnabled = oidcEnabled,
        redirectUris = parsedRedirectUris,
        postLogoutRedirectUris = parsedPostLogoutUris,
        clientType = clientType,
        scopes = parsedScopes.ifEmpty { listOf("openid", "profile", "email") },
        clientSecret = null,
        hasClientSecret = !clientSecret.isNullOrBlank(),
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
