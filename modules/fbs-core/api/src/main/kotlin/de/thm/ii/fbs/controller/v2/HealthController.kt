package de.thm.ii.fbs.controller.v2

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HealthController {

    @GetMapping(
        value = ["/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness", "/health"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun health(): Map<String, String> {
        return mapOf("status" to "UP")
    }
}
