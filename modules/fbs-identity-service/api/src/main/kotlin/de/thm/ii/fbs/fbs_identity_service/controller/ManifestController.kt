package de.thm.ii.fbs.fbs_identity_service.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ManifestController {

    @GetMapping("/manifest")
    fun manifest(): Map<String, String> {
        return mapOf(
        "name" to "fbs-identity-service",
        "status" to "running",
        "version" to "0.1.0"
        )
    }
}