package de.thm.ii.fbs.fbs_identity_service.service.auth

import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import kotlin.test.assertEquals
import kotlin.test.assertNull

@ExtendWith(MockitoExtension::class)
class CurrentUserServiceTest {

    @Mock
    private lateinit var userRepository: UserRepository

    private lateinit var currentUserService: CurrentUserService

    @BeforeEach
    fun setup() {
        currentUserService = CurrentUserService(userRepository)
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `getCurrentUser returns authenticated user`() {
        val jwt = jwtWithSubject("42")
        val userEntity = testUser(id = 42)

        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken(jwt, null)

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)

        val currentUser = currentUserService.getCurrentUser()

        assertEquals(42, currentUser?.id)
        assertEquals("niklas", currentUser?.username)
    }

    @Test
    fun `getCurrentUser returns null when no user is authenticated`() {
        val currentUser = currentUserService.getCurrentUser()

        assertNull(currentUser)
    }

    @Test
    fun `getCurrentUser returns null when jwt subject is not a user id`() {
        val jwt = jwtWithSubject("not-a-number")

        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken(jwt, null)

        val currentUser = currentUserService.getCurrentUser()

        assertNull(currentUser)
    }

    @Test
    fun `getCurrentUser returns null when no active user is found`() {
        val jwt = jwtWithSubject("42")

        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken(jwt, null)

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(null)

        val currentUser = currentUserService.getCurrentUser()

        assertNull(currentUser)
    }

    private fun jwtWithSubject(subject: String): Jwt {
        return Jwt.withTokenValue("token")
            .header("alg", "HS256")
            .subject(subject)
            .claim("username", "niklas")
            .build()
    }

    private fun testUser(
        id: Long = 42,
        username: String = "niklas"
    ) = UserEntity(
        id = id,
        prename = "Niklas",
        surname = "Test",
        email = "niklas@example.com",
        password = "encoded-password",
        username = username,
        privacyChecked = true,
        deleted = false,
        alias = null,
        globalRole = 2
    )
}