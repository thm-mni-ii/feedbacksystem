package de.thm.ii.fbs.model.v2.taskprovider

import java.time.Instant
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "task_providers")
class TaskProviderEntity(
    @Id
    @Column(name = "id", length = 64, nullable = false)
    var id: String,

    @Column(name = "display_name", length = 255, nullable = false)
    var displayName: String,

    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "icon", length = 64, nullable = false)
    var icon: String,

    @Column(name = "version", length = 32, nullable = false)
    var version: String,

    @Column(name = "evaluation_endpoint_url", length = 512, nullable = false)
    var evaluationEndpointUrl: String,

    @Column(name = "health_endpoint_url", length = 512, nullable = false)
    var healthEndpointUrl: String,

    @Column(name = "config_ui_url", length = 512)
    var configUiUrl: String? = null,

    @Column(name = "solve_ui_url", length = 512)
    var solveUiUrl: String? = null,

    @Column(name = "result_ui_url", length = 512)
    var resultUiUrl: String? = null,

    @Column(name = "supported_media_types", columnDefinition = "TEXT", nullable = false)
    var supportedMediaTypes: String = "[]",

    @Column(name = "has_subtasks", nullable = false)
    var hasSubtasks: Boolean = false,

    @Column(name = "supports_staged_feedback", nullable = false)
    var supportsStagedFeedback: Boolean = false,

    @Column(name = "config_schema", columnDefinition = "TEXT")
    var configSchema: String? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()
)
