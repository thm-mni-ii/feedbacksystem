package de.thm.ii.fbs.fbs_identity_service.service.app

import de.thm.ii.fbs.fbs_identity_service.dto.app.CreateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.dto.app.UpdateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.exception.ApplicationProviderAlreadyExistsException
import de.thm.ii.fbs.fbs_identity_service.exception.ApplicationProviderNotFoundException
import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.ApplicationProvider
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.security.oidc.OidcClientSyncService
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URI
import java.security.SecureRandom
import java.util.Base64

@Service
class ApplicationProviderService(
    private val repository: ApplicationProviderRepository,
    private val currentUserService: CurrentUserService,
    private val oidcClientSyncService: OidcClientSyncService,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional(readOnly = true)
    fun getVisibleProvidersForCurrentUser(): List<ApplicationProvider> {
        val currentUser = currentUserService.getCurrentUser()
        val userRole = currentUser?.globalRole

        val allowedRoles = when (userRole) {
            null -> listOf(AppRequiredRole.ALL)
            GlobalRole.USER -> listOf(AppRequiredRole.ALL, AppRequiredRole.USER)
            GlobalRole.MODERATOR -> listOf(AppRequiredRole.ALL, AppRequiredRole.USER, AppRequiredRole.MODERATOR)
            GlobalRole.ADMIN -> listOf(
                AppRequiredRole.ALL,
                AppRequiredRole.USER,
                AppRequiredRole.MODERATOR,
                AppRequiredRole.ADMIN
            )
        }

        return repository.findAllByIsActiveTrueAndRequiredGlobalRoleInOrderByNavbarPositionAscTitleAsc(allowedRoles)
            .map { it.toModel() }
    }

    @Transactional(readOnly = true)
    fun getAllProvidersAdmin(): List<ApplicationProvider> {
        return repository.findAllByOrderByNavbarPositionAscTitleAsc().map { it.toModel() }
    }

    @Transactional(readOnly = true)
    fun getProviderById(id: String): ApplicationProvider {
        return repository.findById(id)
            .map { it.toModel() }
            .orElseThrow { ApplicationProviderNotFoundException(id) }
    }

    @Transactional
    fun createProvider(request: CreateApplicationProviderRequest): ApplicationProvider {
        if (repository.existsById(request.id)) {
            throw ApplicationProviderAlreadyExistsException(request.id)
        }

        if (request.isDefault) {
            unsetDefaultOnOtherProviders()
        }

        validateUris(request.redirectUris, "redirectUris")
        validateUris(request.postLogoutRedirectUris, "postLogoutRedirectUris")

        val oidcEnabled = request.oidcEnabled ?: (!request.clientId.isNullOrBlank())
        val effectiveClientId = request.clientId?.trim()?.ifBlank { null }
            ?: if (oidcEnabled) request.id.trim() else null

        val redirectUrisStr = request.redirectUris?.joinToString(",") { it.trim() }?.ifBlank { null }
        val postLogoutUrisStr = request.postLogoutRedirectUris?.joinToString(",") { it.trim() }?.ifBlank { null }
        val scopesStr = request.scopes?.joinToString(",") { it.trim() }?.ifBlank { null } ?: "openid,profile,email"
        val clientTypeStr = normalizeClientType(request.clientType)

        val rawClientSecret = when {
            request.clientSecret != null && request.clientSecret.isNotBlank() -> request.clientSecret.trim()
            clientTypeStr.equals("CONFIDENTIAL", ignoreCase = true) -> generateSecureSecret()
            else -> null
        }

        val encodedSecret = rawClientSecret?.let { passwordEncoder.encode(it) }

        val entity = ApplicationProviderEntity(
            id = request.id.trim(),
            title = request.title.trim(),
            description = request.description?.trim(),
            icon = request.icon.trim(),
            url = request.url.trim(),
            embedMode = request.embedMode,
            requiredGlobalRole = request.requiredGlobalRole,
            navbarPosition = request.navbarPosition,
            showInNavbar = request.showInNavbar,
            isDefault = request.isDefault,
            isActive = request.isActive,
            isInternal = request.isInternal,
            clientId = effectiveClientId,
            oidcEnabled = oidcEnabled,
            redirectUris = redirectUrisStr,
            postLogoutRedirectUris = postLogoutUrisStr,
            clientType = clientTypeStr,
            scopes = scopesStr,
            clientSecret = encodedSecret
        )

        val saved = repository.save(entity)
        if (saved.oidcEnabled || saved.clientId != null) {
            oidcClientSyncService.syncClient(saved)
        }

        return saved.toModel().copy(
            clientSecret = rawClientSecret,
            hasClientSecret = rawClientSecret != null
        )
    }

    @Transactional
    fun updateProvider(id: String, request: UpdateApplicationProviderRequest): ApplicationProvider {
        val entity = repository.findById(id)
            .orElseThrow { ApplicationProviderNotFoundException(id) }

        val oldClientId = entity.clientId

        if (request.isDefault && !entity.isDefault) {
            unsetDefaultOnOtherProviders()
        }

        validateUris(request.redirectUris, "redirectUris")
        validateUris(request.postLogoutRedirectUris, "postLogoutRedirectUris")

        val oidcEnabled = request.oidcEnabled ?: (request.clientId?.isNotBlank() ?: entity.oidcEnabled)
        val effectiveClientId = request.clientId?.trim()?.ifBlank { null }
            ?: if (oidcEnabled) entity.id else null

        val redirectUrisStr = request.redirectUris?.joinToString(",") { it.trim() }?.ifBlank { null }
        val postLogoutUrisStr = request.postLogoutRedirectUris?.joinToString(",") { it.trim() }?.ifBlank { null }
        val scopesStr = request.scopes?.joinToString(",") { it.trim() }?.ifBlank { null } ?: entity.scopes
        val clientTypeStr = if (request.clientType != null) normalizeClientType(request.clientType) else entity.clientType

        entity.title = request.title.trim()
        entity.description = request.description?.trim()
        entity.icon = request.icon.trim()
        entity.url = request.url.trim()
        entity.embedMode = request.embedMode
        entity.requiredGlobalRole = request.requiredGlobalRole
        entity.navbarPosition = request.navbarPosition
        entity.showInNavbar = request.showInNavbar
        entity.isDefault = request.isDefault
        entity.isActive = request.isActive
        if (request.isInternal != null) entity.isInternal = request.isInternal
        entity.clientId = effectiveClientId
        entity.oidcEnabled = oidcEnabled
        if (request.redirectUris != null) entity.redirectUris = redirectUrisStr
        if (request.postLogoutRedirectUris != null) entity.postLogoutRedirectUris = postLogoutUrisStr
        if (request.scopes != null) entity.scopes = scopesStr
        if (request.clientType != null) entity.clientType = clientTypeStr
        var rawClientSecret: String? = null
        if (request.clientSecret != null && request.clientSecret.isNotBlank()) {
            rawClientSecret = request.clientSecret.trim()
            entity.clientSecret = passwordEncoder.encode(rawClientSecret)
        } else if (clientTypeStr.equals("CONFIDENTIAL", ignoreCase = true) && entity.clientSecret.isNullOrBlank()) {
            rawClientSecret = generateSecureSecret()
            entity.clientSecret = passwordEncoder.encode(rawClientSecret)
        } else if (clientTypeStr.equals("PUBLIC", ignoreCase = true)) {
            entity.clientSecret = null
        }

        val saved = repository.save(entity)

        if (oldClientId != null && oldClientId != saved.clientId) {
            oidcClientSyncService.deleteClient(oldClientId)
        }

        if (saved.oidcEnabled || saved.clientId != null) {
            oidcClientSyncService.syncClient(saved)
        } else if (oldClientId != null) {
            oidcClientSyncService.deleteClient(oldClientId)
        }

        return saved.toModel().copy(
            clientSecret = rawClientSecret,
            hasClientSecret = !saved.clientSecret.isNullOrBlank()
        )
    }

    @Transactional
    fun deleteProvider(id: String): Boolean {
        val entity = repository.findById(id)
            .orElseThrow { ApplicationProviderNotFoundException(id) }

        val clientId = entity.clientId ?: (if (entity.oidcEnabled) entity.id else null)
        if (clientId != null) {
            oidcClientSyncService.deleteClient(clientId)
        }

        repository.delete(entity)
        return true
    }

    @Transactional
    fun regenerateSecret(id: String): ApplicationProvider {
        val entity = repository.findById(id)
            .orElseThrow { ApplicationProviderNotFoundException(id) }

        val newSecret = generateSecureSecret()
        entity.clientSecret = passwordEncoder.encode(newSecret)
        entity.clientType = "CONFIDENTIAL"
        entity.oidcEnabled = true
        if (entity.clientId.isNullOrBlank()) {
            entity.clientId = entity.id
        }

        val saved = repository.save(entity)
        oidcClientSyncService.syncClient(saved)

        return saved.toModel().copy(
            clientSecret = newSecret,
            hasClientSecret = true
        )
    }

    private fun normalizeClientType(clientType: String?): String {
        val trimmed = clientType?.trim()?.uppercase() ?: "PUBLIC"
        require(trimmed == "PUBLIC" || trimmed == "CONFIDENTIAL") {
            "Client type must be either 'PUBLIC' or 'CONFIDENTIAL'"
        }
        return trimmed
    }

    private fun validateUris(uris: List<String>?, fieldName: String) {
        uris?.forEach { uriStr ->
            val trimmed = uriStr.trim()
            if (trimmed.isNotBlank()) {
                val uri = try {
                    URI(trimmed)
                } catch (e: Exception) {
                    throw IllegalArgumentException("Invalid URI in $fieldName: '$trimmed'")
                }
                require(uri.scheme != null && (uri.scheme.equals("https", ignoreCase = true) || uri.scheme.equals("http", ignoreCase = true))) {
                    "URI in $fieldName must use http or https scheme: '$trimmed'"
                }
                require(uri.host != null && uri.host.isNotBlank()) {
                    "URI in $fieldName must have a valid host: '$trimmed'"
                }
                require(uri.fragment == null) {
                    "OAuth2 redirect URI must not contain a URI fragment: '$trimmed'"
                }
            }
        }
    }

    private fun generateSecureSecret(): String {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun unsetDefaultOnOtherProviders() {
        val all = repository.findAll()
        all.filter { it.isDefault }.forEach {
            it.isDefault = false
            repository.save(it)
        }
    }
}
