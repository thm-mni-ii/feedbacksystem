package de.thm.ii.fbs.fbs_identity_service.persistence.entity

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "application_providers")
class ApplicationProviderEntity(
    @Id
    @Column(name = "id", length = 64, nullable = false)
    var id: String = "",

    @Column(name = "title", length = 255, nullable = false)
    var title: String = "",

    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "icon", length = 64, nullable = false)
    var icon: String = "",

    @Column(name = "url", length = 512, nullable = false)
    var url: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "embed_mode", length = 32, nullable = false)
    var embedMode: EmbedMode = EmbedMode.IFRAME,

    @Enumerated(EnumType.STRING)
    @Column(name = "required_global_role", length = 32, nullable = false)
    var requiredGlobalRole: AppRequiredRole = AppRequiredRole.ALL,

    @Column(name = "navbar_position", nullable = false)
    var navbarPosition: Int = 100,

    @Column(name = "show_in_navbar", nullable = false)
    var showInNavbar: Boolean = true,

    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "client_id", length = 128)
    var clientId: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    var createdAt: Instant? = null,

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: Instant? = null
)
