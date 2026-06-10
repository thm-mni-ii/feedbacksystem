package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.dto.user.ChangeOwnPasswordInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.ChangeUserPasswordInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.CreateUserInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.PaginationInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UpdateGlobalRoleInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UserFilterInput
import de.thm.ii.fbs.fbs_identity_service.dto.user.UserPage
import de.thm.ii.fbs.fbs_identity_service.model.User
import de.thm.ii.fbs.fbs_identity_service.service.UserService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class UserGraphQlController(
    private val userService: UserService
) {

    @QueryMapping
    fun currentUser(): User? {
        return userService.getCurrentUser()
    }

    @QueryMapping
    fun user(@Argument id: Long): User? {
        return userService.findUserById(id)
    }

    @QueryMapping
    fun users(
        @Argument filter: UserFilterInput?,
        @Argument pagination: PaginationInput?
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

    @MutationMapping
    fun createUser(@Argument input: CreateUserInput): User {
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

    @MutationMapping
    fun updateGlobalRole(@Argument input: UpdateGlobalRoleInput): User? {
        return userService.updateGlobalRole(
            userId = input.userId,
            globalRole = input.globalRole
        )
    }

    @MutationMapping
    fun deactivateUser(@Argument userId: Long): Boolean {
        return userService.deactivateUser(userId)
    }

    @MutationMapping
    fun changeOwnPassword(@Argument input: ChangeOwnPasswordInput): Boolean {
        return userService.changeOwnPassword(
            currentPassword = input.currentPassword,
            newPassword = input.newPassword,
            newPasswordRepeat = input.newPasswordRepeat
        )
    }

    @MutationMapping
    fun changeUserPassword(@Argument input: ChangeUserPasswordInput): Boolean {
        return userService.changeUserPassword(
            userId = input.userId,
            newPassword = input.newPassword,
            newPasswordRepeat = input.newPasswordRepeat
        )
    }
}