package de.thm.ii.fbs.fbs_identity_service.exception.dto

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorResponse(
    val timestamp: Instant,
    val status: Int,
    val error: String,
    val message: String?,
    val path: String
)
