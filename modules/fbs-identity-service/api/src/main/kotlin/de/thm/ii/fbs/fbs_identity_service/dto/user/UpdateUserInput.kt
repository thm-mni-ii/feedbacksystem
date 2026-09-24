package de.thm.ii.fbs.fbs_identity_service.dto.user

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class UpdateUserInput(
    @field:Positive
    val userId: Long,

    @field:NotBlank
    @field:Size(max = 255)
    val prename: String,

    @field:NotBlank
    @field:Size(max = 255)
    val surname: String,

    @field:NotBlank
    @field:Email
    @field:Size(max = 255)
    val email: String,

    @field:Size(max = 255)
    val alias: String? = null
)
