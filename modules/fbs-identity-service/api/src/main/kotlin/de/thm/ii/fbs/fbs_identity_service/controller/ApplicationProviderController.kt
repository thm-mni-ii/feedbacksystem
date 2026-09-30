package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.app.ApplicationProviderResponse
import de.thm.ii.fbs.fbs_identity_service.dto.app.CreateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.dto.app.PublicApplicationProviderResponse
import de.thm.ii.fbs.fbs_identity_service.dto.app.UpdateApplicationProviderRequest
import de.thm.ii.fbs.fbs_identity_service.service.app.ApplicationProviderService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Application Providers", description = "Endpoints for managing Application Providers in FBS Shell")
@RestController
@RequestMapping("/api/v2")
class ApplicationProviderController(
    private val applicationProviderService: ApplicationProviderService
) {

    @Operation(summary = "Get all active application providers visible to the current user's role")
    @GetMapping("/application-providers")
    fun getVisibleApplicationProviders(): List<PublicApplicationProviderResponse> {
        return applicationProviderService.getVisibleProvidersForCurrentUser()
            .map { PublicApplicationProviderResponse.fromModel(it) }
    }

    @Operation(summary = "Admin: Get all registered application providers")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/application-providers")
    fun getAllApplicationProvidersAdmin(): List<ApplicationProviderResponse> {
        return applicationProviderService.getAllProvidersAdmin()
            .map { ApplicationProviderResponse.fromModel(it, includeSecret = false) }
    }

    @Operation(summary = "Admin: Get a single application provider by ID")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/application-providers/{id}")
    fun getApplicationProviderById(@PathVariable id: String): ApplicationProviderResponse {
        return ApplicationProviderResponse.fromModel(
            applicationProviderService.getProviderById(id),
            includeSecret = false
        )
    }

    @Operation(summary = "Admin: Register a new application provider")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/application-providers")
    @ResponseStatus(HttpStatus.CREATED)
    fun createApplicationProvider(
        @Valid @RequestBody request: CreateApplicationProviderRequest
    ): ApplicationProviderResponse {
        val created = applicationProviderService.createProvider(request)
        return ApplicationProviderResponse.fromModel(created, includeSecret = true)
    }

    @Operation(summary = "Admin: Update an existing application provider")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/application-providers/{id}")
    fun updateApplicationProvider(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateApplicationProviderRequest
    ): ApplicationProviderResponse {
        val updated = applicationProviderService.updateProvider(id, request)
        return ApplicationProviderResponse.fromModel(updated, includeSecret = request.clientSecret != null)
    }

    @Operation(summary = "Admin: Regenerate OIDC client secret for an application provider")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/application-providers/{id}/regenerate-secret")
    fun regenerateSecret(@PathVariable id: String): ApplicationProviderResponse {
        val updated = applicationProviderService.regenerateSecret(id)
        return ApplicationProviderResponse.fromModel(updated, includeSecret = true)
    }

    @Operation(summary = "Admin: Delete an application provider")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/application-providers/{id}")
    fun deleteApplicationProvider(@PathVariable id: String): ResponseEntity<Void> {
        applicationProviderService.deleteProvider(id)
        return ResponseEntity.noContent().build()
    }
}
