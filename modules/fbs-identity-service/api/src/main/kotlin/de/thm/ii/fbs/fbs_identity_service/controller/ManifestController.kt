package de.thm.ii.fbs.fbs_identity_service.controller

import com.fasterxml.jackson.annotation.JsonInclude
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Manifest", description = "Service metadata and capability overview")
@RestController
class ManifestController(
    @param:Value("\${spring.application.name:fbs-identity-service}")
    private val serviceName: String,

    @param:Value("\${info.app.version:0.0.1-SNAPSHOT}")
    private val version: String
) {

    @Operation(
        summary = "Get service manifest",
        description = "Returns service metadata, exposed endpoints and available capabilities of the Identity Service."
    )
    @GetMapping("/manifest", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun manifest(): ServiceManifest {
        return ServiceManifest(
            service = serviceName,
            version = version,
            description = "Provides authentication, user management and identity functions for the FBS.",
            endpoints = ManifestEndpoints(
                health = "/health",
                manifest = "/manifest",
                graphql = "/graphql"
            ),
            capabilities = capabilities()
        )
    }

    private fun capabilities(): List<Capability> {
        return listOf(
            Capability(
                id = "identity.auth.local-login",
                type = "rest-endpoint",
                method = "POST",
                path = "/api/v1/auth/login",
                description = "Authenticates a user with username and password"
            ),
            Capability(
                id = "identity.legal.text.read",
                type = "rest-endpoint",
                method = "GET",
                path = "/api/v1/legal/{filename}",
                description = "Returns a legal text as Markdown"
            ),
            Capability(
                id = "identity.legal.terms-of-use.read",
                type = "rest-endpoint",
                method = "GET",
                path = "/api/v1/legal/termsofuse/{uid}",
                requiresAuthentication = true,
                description = "Returns whether the current user accepted the terms of use"
            ),
            Capability(
                id = "identity.legal.terms-of-use.update",
                type = "rest-endpoint",
                method = "PUT",
                path = "/api/v1/legal/termsofuse/{uid}",
                requiresAuthentication = true,
                description = "Stores that the current user accepted the terms of use"
            ),
            Capability(
                id = "identity.auth.saml-login.start",
                type = "rest-endpoint",
                method = "GET",
                path = "/api/v1/login/sso",
                description = "Starts the SAML login flow",
                requiresConfig = "app.saml.enabled=true"
            ),

            Capability(
                id = "identity.user.current.read",
                type = "graphql-query",
                endpoint = "/graphql",
                operation = "currentUser",
                requiresAuthentication = true,
                description = "Returns the currently authenticated user"
            ),
            Capability(
                id = "identity.user.read",
                type = "graphql-query",
                endpoint = "/graphql",
                operation = "user",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Returns a user by id"
            ),
            Capability(
                id = "identity.user.search",
                type = "graphql-query",
                endpoint = "/graphql",
                operation = "users",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Searches users with filter and pagination"
            ),
            Capability(
                id = "identity.user.create",
                type = "graphql-mutation",
                endpoint = "/graphql",
                operation = "createUser",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Creates a new user"
            ),
            Capability(
                id = "identity.user.password.change-own",
                type = "graphql-mutation",
                endpoint = "/graphql",
                operation = "changeOwnPassword",
                requiresAuthentication = true,
                description = "Allows the current user to change their own password"
            ),
            Capability(
                id = "identity.user.password.change-other",
                type = "graphql-mutation",
                endpoint = "/graphql",
                operation = "changeUserPassword",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Allows changing another user's password"
            ),
            Capability(
                id = "identity.user.global-role.update",
                type = "graphql-mutation",
                endpoint = "/graphql",
                operation = "updateGlobalRole",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Updates the global role of a user"
            ),
            Capability(
                id = "identity.user.deactivate",
                type = "graphql-mutation",
                endpoint = "/graphql",
                operation = "deactivateUser",
                requiresAuthentication = true,
                requiredRole = "ADMIN",
                description = "Deactivates a user"
            )
        )
    }
}

data class ServiceManifest(
    val service: String,
    val version: String,
    val description: String,
    val endpoints: ManifestEndpoints,
    val capabilities: List<Capability>
)

data class ManifestEndpoints(
    val health: String,
    val manifest: String,
    val graphql: String
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class Capability(
    val id: String,
    val type: String,
    val description: String,
    val method: String? = null,
    val path: String? = null,
    val endpoint: String? = null,
    val operation: String? = null,
    val requiresConfig: String? = null,
    val requiredRole: String? = null,
    val requiresAuthentication: Boolean = false
)
