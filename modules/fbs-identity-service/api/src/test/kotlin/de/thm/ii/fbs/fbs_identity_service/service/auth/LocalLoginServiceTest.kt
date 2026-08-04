package de.thm.ii.fbs.fbs_identity_service.service.auth

import de.thm.ii.fbs.fbs_identity_service.exception.InvalidCredentialsException
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows

@ExtendWith(MockitoExtension::class)
class LocalLoginServiceTest {

    @Mock
    lateinit var jwtService: JwtService

    @Mock
    lateinit var userRepository: UserRepository

    @Mock
    lateinit var passwordEncoder: PasswordEncoder

    private lateinit var localLoginService: LocalLoginService

    @BeforeEach
    fun setUp() {
        localLoginService = LocalLoginService(jwtService, userRepository, passwordEncoder)
    }

    @Test
    fun `login returns access token for valid credentials`() {
        val encodedPassword = "encoded-password"
        val user = testUser(password = encodedPassword)

        whenever(userRepository.findByUsernameAndDeletedFalse("niklas")).thenReturn(user)
        whenever(passwordEncoder.matches("correct-password", encodedPassword)).thenReturn(true)
        whenever(jwtService.createToken(user.toModel())).thenReturn("jwt-token")
        whenever(jwtService.getExpiresIn()).thenReturn(3600)

        val response = localLoginService.login("niklas", "correct-password")

        assertEquals("jwt-token", response.accessToken)
        assertEquals(3600, response.expiresIn)
    }

    @Test
    fun `login rejects unknown user`() {
        whenever(userRepository.findByUsernameAndDeletedFalse("unknown")).thenReturn(null)

        val exception = assertThrows(InvalidCredentialsException::class.java) {
            localLoginService.login("unknown", "password")
        }

        assertEquals("Invalid username or password", exception.message)
        verify(passwordEncoder, never()).matches(any(), any())
        verify(jwtService, never()).createToken(any())
    }

    @Test
    fun `login rejects incorrect password`() {
        val encodedPassword = "encoded-password"
        val user = testUser(password = encodedPassword)

        whenever(userRepository.findByUsernameAndDeletedFalse("niklas")).thenReturn(user)
        whenever(passwordEncoder.matches("wrong-password", encodedPassword)).thenReturn(false)

        val exception = assertThrows(InvalidCredentialsException::class.java) {
            localLoginService.login("niklas", "wrong-password")
        }

        assertEquals("Invalid username or password", exception.message)
        verify(jwtService, never()).createToken(any())
    }

    @Test
    fun `login rejects user without stored password`() {
        val user = testUser(password = null)

        whenever(userRepository.findByUsernameAndDeletedFalse("niklas")).thenReturn(user)

        val exception = assertThrows(InvalidCredentialsException::class.java) {
            localLoginService.login("niklas", "password")
        }

        assertEquals("Invalid username or password", exception.message)
        verify(passwordEncoder, never()).matches(any(), any())
        verify(jwtService, never()).createToken(any())
    }

    @Test
    fun `login rejects deleted user`() {
        whenever(userRepository.findByUsernameAndDeletedFalse("deleted-user")).thenReturn(null)

        val exception = assertThrows(InvalidCredentialsException::class.java) {
            localLoginService.login("deleted-user", "password")
        }

        assertEquals("Invalid username or password", exception.message)
        verify(passwordEncoder, never()).matches(any(), any())
        verify(jwtService, never()).createToken(any())
    }

    private fun testUser(
        id: Long = 36,
        username: String = "niklas",
        password: String? = "encoded-password"
    ) = UserEntity(
        id = id,
        prename = "Niklas",
        surname = "Test",
        email = "niklas@example.com",
        password = password,
        username = username,
        privacyChecked = true,
        deleted = false,
        alias = null,
        globalRole = 2
    )
}
