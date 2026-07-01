package de.thm.ii.fbs.fbs_identity_service.controller

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
import kotlin.test.assertTrue

@GraphQlTest(UserGraphQlController::class)
@Import(MethodSecurityTestConfig::class)
class UserGraphQlControllerTest {

    @Autowired
    private lateinit var graphQlTester: GraphQlTester

    @MockitoBean
    private lateinit var userService: UserService

    @Test
    fun `currentUser returns current user`() {
        whenever(userService.getCurrentUser()).thenReturn(testUser(id = 42, username = "niklas"))

        graphQlTester.document(
            """
            query {
              currentUser {
                id
                username
                globalRole
              }
            }
            """.trimIndent()
        )
            .execute()
            .path("currentUser.id").entity(String::class.java).isEqualTo("42")
            .path("currentUser.username").entity(String::class.java).isEqualTo("niklas")
            .path("currentUser.globalRole").entity(String::class.java).isEqualTo("USER")
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
                }
              }
            }
            """.trimIndent()
        )
            .execute()
            .path("users.totalCount").entity(Int::class.java).isEqualTo(1)
            .path("users.items[0].id").entity(String::class.java).isEqualTo("42")
            .path("users.items[0].username").entity(String::class.java).isEqualTo("niklas")
            .path("users.items[0].globalRole").entity(String::class.java).isEqualTo("USER")
    }

    @Test
    @WithMockUser(roles = ["USER"])
    fun `users query is forbidden for normal user`(){
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
                assertTrue(errors.isNotEmpty())
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
            .path("createUser.id").entity(String::class.java).isEqualTo("42")
            .path("createUser.username").entity(String::class.java).isEqualTo("niklas")
            .path("createUser.globalRole").entity(String::class.java).isEqualTo("ADMIN")
            .path("createUser.alias").entity(String::class.java).isEqualTo("ne")
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
                assertTrue(errors.isNotEmpty())
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
        alias = alias
    )
}

@TestConfiguration
@EnableMethodSecurity
class MethodSecurityTestConfig