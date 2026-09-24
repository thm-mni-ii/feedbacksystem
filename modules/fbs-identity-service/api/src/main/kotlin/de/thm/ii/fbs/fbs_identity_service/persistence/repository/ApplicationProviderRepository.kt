package de.thm.ii.fbs.fbs_identity_service.persistence.repository

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ApplicationProviderRepository : JpaRepository<ApplicationProviderEntity, String> {

    fun findAllByIsActiveTrueOrderByNavbarPositionAscTitleAsc(): List<ApplicationProviderEntity>

    fun findAllByIsActiveTrueAndRequiredGlobalRoleInOrderByNavbarPositionAscTitleAsc(
        requiredGlobalRoles: Collection<AppRequiredRole>
    ): List<ApplicationProviderEntity>

    fun findAllByOrderByNavbarPositionAscTitleAsc(): List<ApplicationProviderEntity>
}
