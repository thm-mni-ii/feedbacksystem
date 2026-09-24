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
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ApplicationProviderService(
    private val repository: ApplicationProviderRepository,
    private val currentUserService: CurrentUserService
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
            clientId = request.clientId?.trim()?.ifBlank { null }
        )

        return repository.save(entity).toModel()
    }

    @Transactional
    fun updateProvider(id: String, request: UpdateApplicationProviderRequest): ApplicationProvider {
        val entity = repository.findById(id)
            .orElseThrow { ApplicationProviderNotFoundException(id) }

        if (request.isDefault && !entity.isDefault) {
            unsetDefaultOnOtherProviders()
        }

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
        entity.clientId = request.clientId?.trim()?.ifBlank { null }

        return repository.save(entity).toModel()
    }

    @Transactional
    fun deleteProvider(id: String): Boolean {
        val entity = repository.findById(id)
            .orElseThrow { ApplicationProviderNotFoundException(id) }

        repository.delete(entity)
        return true
    }

    private fun unsetDefaultOnOtherProviders() {
        val all = repository.findAll()
        all.filter { it.isDefault }.forEach {
            it.isDefault = false
            repository.save(it)
        }
    }
}
