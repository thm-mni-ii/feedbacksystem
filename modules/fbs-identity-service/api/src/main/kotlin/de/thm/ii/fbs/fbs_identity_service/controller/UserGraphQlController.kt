package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.user.ChangeOwnPasswordInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.ChangeUserPasswordInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.CreateUserInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.PaginationInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UpdateGlobalRoleInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UserFilterInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UserPage
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import org.springframework.security.access.prepost.PreAuthorize
import jakarta.validation.Valid
import jakarta.validation.constraints.Positive

@Controller
class UserGraphQlController(
    private val userService: UserService
) {
    @QueryMapping
    fun currentUser(): User? {
        return userService.getCurrentUser()
    }

    @PreAuthorize("hasRole('ADMIN')")
    @QueryMapping
    fun user(@Argument @Positive id: Long): User? {
        return userService.findUserById(id)
    }

    @PreAuthorize("hasRole('ADMIN')")
    @QueryMapping
    fun users(
        @Argument @Valid filter: UserFilterInput?,
        @Argument @Valid pagination: PaginationInput?
    ): UserPage {
        val result = userService.findUsers(
            query = filter?.query,
            globalRole = filter?.globalRole,
            limit = pagination?.limit,
            offset = pagination?.offset
        )

        return UserPage(
            items = result.items ,
            totalCount = result.totalCount
        )
    }

    @PreAuthorize("hasRole('ADMIN')")
    @MutationMapping
    fun createUser(@Argument @Valid input: CreateUserInput): User {
        return userService.createUser(
            prename = input.prename,
            surname = input.surname,
            email = input.email,
            username = input.username,
            password = input.password,
            globalRole = input.globalRole,
            alias = input.alias
        )
    }

    @PreAuthorize("hasRole('ADMIN')")
    @MutationMapping
    fun updateGlobalRole(@Argument @Valid input: UpdateGlobalRoleInput): User? {
        return userService.updateGlobalRole(
            userId = input.userId,
            globalRole = input.globalRole
        )
    }

    @PreAuthorize("hasRole('ADMIN')")
    @MutationMapping
    fun deactivateUser(@Argument @Positive userId: Long): Boolean {
        return userService.deactivateUser(userId)
    }

    @MutationMapping
    fun changeOwnPassword(@Argument @Valid input: ChangeOwnPasswordInput): Boolean {
        return userService.changeOwnPassword(
            currentPassword = input.currentPassword,
            newPassword = input.newPassword,
            newPasswordRepeat = input.newPasswordRepeat
        )
    }

    @PreAuthorize("hasRole('ADMIN')")
    @MutationMapping
    fun changeUserPassword(@Argument @Valid input: ChangeUserPasswordInput): Boolean {
        return userService.changeUserPassword(
            userId = input.userId,
            newPassword = input.newPassword,
            newPasswordRepeat = input.newPasswordRepeat
        )
    }
}
