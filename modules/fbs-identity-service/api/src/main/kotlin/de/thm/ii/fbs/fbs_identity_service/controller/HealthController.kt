package de.thm.ii.fbs.fbs_identity_service.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Health", description = "Service health check")
@RestController
class HealthController {

    @Operation(
        summary = "Check service health",
        description = "Checks whether the Identity Service is healthy."
    )
    @GetMapping("/health", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun health(): HealthResponse {
        return HealthResponse("OK")
    }

    data class HealthResponse(
        val status: String
    )
}
