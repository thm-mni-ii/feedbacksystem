package de.thm.ii.fbs.fbs_identity_service.controller

import de.thm.ii.fbs.fbs_identity_service.exception.GraphQlExceptionHandler
import de.thm.ii.fbs.fbs_identity_service.exception.InvalidCurrentPasswordException
import de.thm.ii.fbs.fbs_identity_service.exception.PasswordMismatchException
import de.thm.ii.fbs.fbs_identity_service.exception.UserNotFoundException
import de.thm.ii.fbs.fbs_identity_service.exception.UsernameAlreadyExistsException
import de.thm.ii.fbs.fbs_identity_service.model.user.AuthSource
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.service.user.UserSearchResult
import de.thm.ii.fbs.fbs_identity_service.service.user.UserService
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Import
import org.springframework.graphql.test.tester.GraphQlTester
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.junit.jupiter.api.Test
import org.springframework.graphql.execution.ErrorType
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@GraphQlTest(UserGraphQlController::class)
@Import(MethodSecurityTestConfig::class, GraphQlExceptionHandler::class)
class UserGraphQlControllerTest {

    @Autowired
    private lateinit var graphQlTester: GraphQlTester

    @MockitoBean
    private lateinit var userService: UserService

    @Test
    fun `currentUser returns current user`() {
        whenever(userService.getCurrentUser())
            .thenReturn(testUser(id = 42, username = "niklas"))

        graphQlTester.document(
            """
        query {
          currentUser {
            id
            username
            globalRole
            source
            hasPassword
            displayName
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .verify()
            .path("currentUser.id")
            .entity(String::class.java)
            .isEqualTo("42")
            .path("currentUser.username")
            .entity(String::class.java)
            .isEqualTo("niklas")
            .path("currentUser.globalRole")
            .entity(String::class.java)
            .isEqualTo("USER")
            .path("currentUser.source")
            .entity(String::class.java)
            .isEqualTo("INTERNAL")
            .path("currentUser.hasPassword")
            .entity(Boolean::class.java)
            .isEqualTo(true)
            .path("currentUser.displayName")
            .entity(String::class.java)
            .isEqualTo("Niklas Test")

        verify(userService).getCurrentUser()
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `users query returns users for admin`() {
        whenever(
            userService.findUsers(
                query = null,
                globalRole = null,
                limit = 10,
                offset = 0
            )
        ).thenReturn(
            UserSearchResult(
                items = listOf(testUser(id = 42, username = "niklas")),
                totalCount = 1
            )
        )

        graphQlTester.document(
            """
        query {
          users(pagination: { limit: 10, offset: 0 }) {
            totalCount
            items {
              id
              username
              globalRole
              source
              hasPassword
              displayName
            }
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .verify()
            .path("users.totalCount")
            .entity(Int::class.java)
            .isEqualTo(1)
            .path("users.items[0].id")
            .entity(String::class.java)
            .isEqualTo("42")
            .path("users.items[0].username")
            .entity(String::class.java)
            .isEqualTo("niklas")
            .path("users.items[0].globalRole")
            .entity(String::class.java)
            .isEqualTo("USER")

        verify(userService).findUsers(null, null, 10, offset = 0)
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `users query is forbidden for normal user`() {
        graphQlTester.document(
            """
        query {
          users(pagination: { limit: 10, offset: 0 }) {
            totalCount
            items {
              id
              username
            }
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(errors.size, 1)

                val error = errors.first()

                assertEquals(
                    "Access denied",
                    error.message
                )
                assertEquals(
                    ErrorType.FORBIDDEN,
                    error.errorType
                )
                assertEquals(
                    "ACCESS_DENIED",
                    error.extensions["code"]
                )
            }

        verify(userService, never()).findUsers(any(), any(), any(), any())
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `createUser mutation creates user for admin`() {
        whenever(
            userService.createUser(
                prename = "Niklas",
                surname = "Test",
                email = "niklas@example.com",
                username = "niklas",
                password = "password",
                globalRole = GlobalRole.ADMIN,
                alias = "ne"
            )
        ).thenReturn(
            testUser(
                id = 42,
                username = "niklas",
                globalRole = GlobalRole.ADMIN,
                alias = "ne"
            )
        )

        graphQlTester.document(
            """
        mutation {
          createUser(input: {
            prename: "Niklas",
            surname: "Test",
            email: "niklas@example.com",
            username: "niklas",
            password: "password",
            globalRole: ADMIN,
            alias: "ne"
          }) {
            id
            username
            globalRole
            alias
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .verify()
            .path("createUser.id")
            .entity(String::class.java)
            .isEqualTo("42")
            .path("createUser.username")
            .entity(String::class.java)
            .isEqualTo("niklas")
            .path("createUser.globalRole")
            .entity(String::class.java)
            .isEqualTo("ADMIN")
            .path("createUser.alias")
            .entity(String::class.java)
            .isEqualTo("ne")

        verify(userService).createUser(
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "niklas",
            password = "password",
            globalRole = GlobalRole.ADMIN,
            alias = "ne"
        )
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `updateUser mutation updates user for admin`() {
        whenever(
            userService.updateUser(
                userId = 42L,
                prename = "Jane",
                surname = "Doe",
                email = "jane.doe@example.com",
                alias = "jdoe"
            )
        ).thenReturn(
            testUser(
                id = 42,
                username = "niklas",
                globalRole = GlobalRole.ADMIN,
                alias = "jdoe"
            )
        )

        graphQlTester.document(
            """
        mutation {
          updateUser(input: {
            userId: 42,
            prename: "Jane",
            surname: "Doe",
            email: "jane.doe@example.com",
            alias: "jdoe"
          }) {
            id
            username
            alias
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .verify()
            .path("updateUser.id")
            .entity(String::class.java)
            .isEqualTo("42")
            .path("updateUser.alias")
            .entity(String::class.java)
            .isEqualTo("jdoe")

        verify(userService).updateUser(42L, "Jane", "Doe", "jane.doe@example.com", "jdoe")
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `updateUser mutation is forbidden for normal user`() {
        graphQlTester.document(
            """
        mutation {
          updateUser(input: {
            userId: 42,
            prename: "Jane",
            surname: "Doe",
            email: "jane.doe@example.com",
            alias: "jdoe"
          }) {
            id
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                assertEquals("Access denied", errors.first().message)
                assertEquals(ErrorType.FORBIDDEN, errors.first().errorType)
            }

        verify(userService, never()).updateUser(any(), any(), any(), any(), any())
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `createUser mutation is forbidden for normal User`(){
        graphQlTester.document(
            """
            mutation {
              createUser(input: {
                prename: "Niklas",
                surname: "Test",
                email: "niklas@example.com",
                username: "niklas",
                password: "password",
                globalRole: ADMIN,
                alias: "ne"
              }) {
                id
                username
              }
            }
            """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(errors.size, 1)

                val error = errors.first()

                assertEquals(
                    "Access denied",
                    error.message
                )
                assertEquals(
                    ErrorType.FORBIDDEN,
                    error.errorType
                )
                assertEquals(
                    "ACCESS_DENIED",
                    error.extensions["code"]
                )
            }

        verify(userService, never()).createUser(
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any()
        )
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `createUser mutation with duplicate username returns GraphQL error`() {
        whenever(
            userService.createUser(
                prename = "Niklas",
                surname = "Test",
                email = "niklas@example.com",
                username = "takenUsername",
                password = "password",
                globalRole = GlobalRole.ADMIN,
                alias = "ne"
            )
        ).thenThrow(UsernameAlreadyExistsException("takenUsername"))

        graphQlTester.document(
            """
        mutation {
          createUser(input: {
            prename: "Niklas",
            surname: "Test",
            email: "niklas@example.com",
            username: "takenUsername",
            password: "password",
            globalRole: ADMIN,
            alias: "ne"
          }) {
            id
            username
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)

                val error = errors.first()

                assertEquals(
                    "Username `takenUsername` already exists",
                    error.message
                )
                assertEquals(
                    ErrorType.BAD_REQUEST,
                    error.errorType
                )
                assertEquals(
                    "USERNAME_ALREADY_EXISTS",
                    error.extensions["code"]
                )
            }

        verify(userService).createUser(
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "takenUsername",
            password = "password",
            globalRole = GlobalRole.ADMIN,
            alias = "ne"
        )
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `createUser mutation with invalid input returns validation error`() {
        graphQlTester.document(
            """
        mutation {
          createUser(input: {
            prename: "Niklas",
            surname: "Test",
            email: "niklas@example.com",
            username: "",
            password: "password",
            globalRole: USER
          }) {
            id
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)

                val error = errors.first()

                assertEquals("Invalid input", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("VALIDATION_ERROR", error.extensions["code"])

                val violations = error.extensions["violations"] as List<*>
                assertTrue(violations.isNotEmpty())
            }

        verify(userService, never()).createUser(
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any()
        )
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `createUser mutation with short password returns validation error`() {
        graphQlTester.document(
            """
        mutation {
          createUser(input: {
            prename: "Niklas",
            surname: "Test",
            email: "niklas@example.com",
            username: "niklas",
            password: "short",
            globalRole: USER
          }) {
            id
          }
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("Invalid input", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("VALIDATION_ERROR", error.extensions["code"])
            }

        verify(userService, never()).createUser(any(), any(), any(), any(), any(), any(), any())
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `changeOwnPassword mutation returns true when successful`() {
        whenever(
            userService.changeOwnPassword("oldPassword123", "newPassword123", "newPassword123")
        ).thenReturn(true)

        graphQlTester.document(
            """
        mutation {
          changeOwnPassword(input: {
            currentPassword: "oldPassword123",
            newPassword: "newPassword123",
            newPasswordRepeat: "newPassword123"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .verify()
            .path("changeOwnPassword")
            .entity(Boolean::class.java)
            .isEqualTo(true)

        verify(userService).changeOwnPassword("oldPassword123", "newPassword123", "newPassword123")
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `changeOwnPassword mutation with invalid current password returns INVALID_CURRENT_PASSWORD error`() {
        whenever(
            userService.changeOwnPassword("wrongPassword123", "newPassword123", "newPassword123")
        ).thenThrow(InvalidCurrentPasswordException())

        graphQlTester.document(
            """
        mutation {
          changeOwnPassword(input: {
            currentPassword: "wrongPassword123",
            newPassword: "newPassword123",
            newPasswordRepeat: "newPassword123"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("Current password does not match", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("INVALID_CURRENT_PASSWORD", error.extensions["code"])
            }
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `changeOwnPassword mutation with password mismatch returns PASSWORD_MISMATCH error`() {
        whenever(
            userService.changeOwnPassword("oldPassword123", "newPassword123", "differentPassword123")
        ).thenThrow(PasswordMismatchException())

        graphQlTester.document(
            """
        mutation {
          changeOwnPassword(input: {
            currentPassword: "oldPassword123",
            newPassword: "newPassword123",
            newPasswordRepeat: "differentPassword123"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("New password and confirmation do not match", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("PASSWORD_MISMATCH", error.extensions["code"])
            }
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `changeOwnPassword mutation with short new password returns validation error`() {
        graphQlTester.document(
            """
        mutation {
          changeOwnPassword(input: {
            currentPassword: "oldPassword123",
            newPassword: "short",
            newPasswordRepeat: "short"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("Invalid input", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("VALIDATION_ERROR", error.extensions["code"])
            }

        verify(userService, never()).changeOwnPassword(any(), any(), any())
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `changeUserPassword mutation with password mismatch returns PASSWORD_MISMATCH error`() {
        whenever(
            userService.changeUserPassword(42L, "newPassword123", "differentPassword123")
        ).thenThrow(PasswordMismatchException())

        graphQlTester.document(
            """
        mutation {
          changeUserPassword(input: {
            userId: 42,
            newPassword: "newPassword123",
            newPasswordRepeat: "differentPassword123"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("New password and confirmation do not match", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("PASSWORD_MISMATCH", error.extensions["code"])
            }
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `changeUserPassword mutation with short new password returns validation error`() {
        graphQlTester.document(
            """
        mutation {
          changeUserPassword(input: {
            userId: 42,
            newPassword: "short",
            newPasswordRepeat: "short"
          })
        }
        """.trimIndent()
        )
            .execute()
            .errors()
            .satisfy { errors ->
                assertEquals(1, errors.size)
                val error = errors.first()
                assertEquals("Invalid input", error.message)
                assertEquals(ErrorType.BAD_REQUEST, error.errorType)
                assertEquals("VALIDATION_ERROR", error.extensions["code"])
            }

        verify(userService, never()).changeUserPassword(any(), any(), any())
    }

    private fun testUser(
        id: Long = 1,
        username: String = "niklas",
        globalRole: GlobalRole = GlobalRole.USER,
        alias: String? = null
    ) = User(
        id = id,
        prename = "Niklas",
        surname = "Test",
        email = "niklas@example.com",
        username = username,
        globalRole = globalRole,
        alias = alias,
        source = AuthSource.INTERNAL,
        hasPassword = true,
        displayName = if (alias != null) alias else "Niklas Test"
    )
}

@TestConfiguration
@EnableMethodSecurity
class MethodSecurityTestConfig
