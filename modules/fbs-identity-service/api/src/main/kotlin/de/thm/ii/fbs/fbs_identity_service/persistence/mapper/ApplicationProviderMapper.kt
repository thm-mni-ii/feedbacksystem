package de.thm.ii.fbs.fbs_identity_service.persistence.mapper

import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity

fun ApplicationProviderEntity.toModel(): ApplicationProvider {
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
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
