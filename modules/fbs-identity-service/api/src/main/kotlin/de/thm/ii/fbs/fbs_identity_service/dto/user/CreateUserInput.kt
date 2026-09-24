package de.thm.ii.fbs.fbs_identity_service.dto.user

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateUserInput(
    @field:Size(max = 100)
    @field:NotBlank
    val prename: String,

    @field:Size(max = 100)
    @field:NotBlank
    val surname: String,

    @field:Size(max = 100)
    @field:Email
    @field:NotBlank
    val email: String,

    @field:Size(max = 200)
    @field:NotBlank
    val username: String,

    @field:NotBlank
    @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters long")
    val password: String,

    val globalRole: GlobalRole?,

    @field:Size(max = 20)
    val alias: String?
)
