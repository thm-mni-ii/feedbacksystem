package de.thm.ii.fbs.fbs_identity_service.service.user

import de.thm.ii.fbs.fbs_identity_service.exception.UsernameAlreadyExistsException
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.UserEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.mapper.toModel
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.UserRepository
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.kotlin.any
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class UserServiceTest {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @Mock
    private lateinit var currentUserService: CurrentUserService

    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userService = UserService(userRepository, passwordEncoder, currentUserService)
    }

    @Test
    fun `findUserById returns active user`() {
        val userEntity = testUserEntity(id = 42, username = "niklas")

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)

        val user = userService.findUserById(42)

        assertEquals(42, user?.id)
        assertEquals("niklas", user?.username)
    }

    @Test
    fun `findUserById returns null when no active user is found`() {
        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(null)

        val user = userService.findUserById(42)

        assertNull(user)
    }

    @Test
    fun `createUser encodes password and saves user`() {
        whenever(passwordEncoder.encode("plain-password")).thenReturn("encoded-password")
        whenever(userRepository.existsByUsername("niklas")).thenReturn(false)
        whenever(userRepository.saveAndFlush(any<UserEntity>())).thenAnswer { invocation ->
            val userEntity = invocation.getArgument<UserEntity>(0)
            UserEntity(
                id = 42,
                prename = userEntity.prename,
                surname = userEntity.surname,
                email = userEntity.email,
                password = userEntity.password,
                username = userEntity.username,
                privacyChecked = userEntity.privacyChecked,
                deleted = userEntity.deleted,
                alias = userEntity.alias,
                globalRole = userEntity.globalRole
            )
        }

        val user = userService.createUser(
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "niklas",
            password = "plain-password",
            globalRole = GlobalRole.ADMIN,
            alias = "ne"
        )

        assertEquals(42, user.id)
        assertEquals("niklas", user.username)
        assertEquals(GlobalRole.ADMIN, user.globalRole)

        val captor = argumentCaptor<UserEntity>()
        verify(userRepository).saveAndFlush(captor.capture())
        verify(userRepository).existsByUsername("niklas")

        assertEquals("encoded-password", captor.firstValue.password)
        assertEquals(GlobalRole.ADMIN.id, captor.firstValue.globalRole)
        assertEquals("ne", captor.firstValue.alias)
    }

    @Test
    fun `createUser with taken username throws UsernameAlreadyExistsException`() {
        whenever(userRepository.existsByUsername("takenUsername")).thenReturn(true)

        val exception = assertThrows<UsernameAlreadyExistsException> {
            userService.createUser(
                prename = "Niklas",
                surname = "Test",
                email = "niklas@example.com",
                username = "takenUsername",
                password = "plain-password",
                globalRole = GlobalRole.USER,
                alias = "ne"
            )
        }

        assertEquals(
            "Username `takenUsername` already exists",
            exception.message
        )

        verify(userRepository).existsByUsername("takenUsername")
        verify(userRepository, never()).saveAndFlush(any<UserEntity>())
        verify(passwordEncoder, never()).encode(any())
    }

    @Test
    fun `createExternalUser saves user without password`() {
        whenever(userRepository.saveAndFlush(any<UserEntity>())).thenAnswer { invocation ->
            val userEntity = invocation.getArgument<UserEntity>(0)
            UserEntity(
                id = 42,
                prename = userEntity.prename,
                surname = userEntity.surname,
                email = userEntity.email,
                password = userEntity.password,
                username = userEntity.username,
                privacyChecked = userEntity.privacyChecked,
                deleted = userEntity.deleted,
                alias = userEntity.alias,
                globalRole = userEntity.globalRole
            )
        }
        whenever(userRepository.existsByUsername("samlUser")).thenReturn(false)

        val user = userService.createExternalUser(
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com",
            username = "samlUser"
        )

        assertEquals(42, user.id)
        assertEquals("samlUser", user.username)
        assertEquals(GlobalRole.USER, user.globalRole)

        val captor = argumentCaptor<UserEntity>()
        verify(userRepository).saveAndFlush(captor.capture())
        verify(userRepository).existsByUsername("samlUser")

        assertNull(captor.firstValue.password)
        assertEquals(GlobalRole.USER.id, captor.firstValue.globalRole)
    }

    @Test
    fun `createExternalUser with taken username throws UsernameAlreadyExistsException`() {
        whenever(userRepository.existsByUsername("takenUsername")).thenReturn(true)

        val exception = assertThrows<UsernameAlreadyExistsException> {
            userService.createExternalUser(
                prename = "Niklas",
                surname = "Test",
                email = "niklas@example.com",
                username = "takenUsername",
                globalRole = GlobalRole.USER,
                alias = "ne"
            )
        }

        assertEquals(
            "Username `takenUsername` already exists",
            exception.message
        )

        verify(userRepository).existsByUsername("takenUsername")
        verify(userRepository, never()).saveAndFlush(any<UserEntity>())
    }

    @Test
    fun `createExternalUser maps database constraint violation to UsernameAlreadyExistsException`() {
        whenever(userRepository.existsByUsername("takenUsername")).thenReturn(false)
        whenever(userRepository.saveAndFlush(any<UserEntity>()))
            .thenThrow(DataIntegrityViolationException("Duplicate username"))

        val exception = assertThrows<UsernameAlreadyExistsException> {
            userService.createExternalUser(
                prename = "Niklas",
                surname = "Test",
                email = "niklas@example.com",
                username = "takenUsername",
                globalRole = GlobalRole.USER,
                alias = "ne"
            )
        }

        assertEquals("Username `takenUsername` already exists", exception.message)

        verify(userRepository).existsByUsername("takenUsername")
        verify(userRepository).saveAndFlush(any<UserEntity>())
    }

    @Test
    fun `updateGlobalRole updates user role`() {
        val userEntity = testUserEntity(id = 42, globalRole = GlobalRole.USER.id)

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)
        whenever(userRepository.save(userEntity)).thenReturn(userEntity)

        val user = userService.updateGlobalRole(42, GlobalRole.ADMIN)

        assertEquals(GlobalRole.ADMIN, user?.globalRole)
        assertEquals(GlobalRole.ADMIN.id, userEntity.globalRole)
        verify(userRepository).save(userEntity)
    }

    @Test
    fun `updateGlobalRole returns null when no active user is found`() {
        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(null)

        val user = userService.updateGlobalRole(42, GlobalRole.ADMIN)

        assertNull(user)
        verify(userRepository, never()).save(any())
    }

    @Test
    fun `deactivateUser anonymizes user`() {
        val userEntity = testUserEntity(
            id = 42,
            username = "niklas",
            password = "encoded-password",
            globalRole = GlobalRole.ADMIN.id,
            alias = "ne"
        )

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)

        val result = userService.deactivateUser(42)

        assertTrue(result)
        assertEquals("Deleted User", userEntity.prename)
        assertEquals("Deleted User", userEntity.surname)
        assertEquals("", userEntity.email)
        assertEquals("duser 42", userEntity.username)
        assertTrue(userEntity.deleted)
        assertNull(userEntity.password)
        assertEquals(GlobalRole.USER.id, userEntity.globalRole)
        assertNull(userEntity.alias)

        verify(userRepository).save(userEntity)
    }

    @Test
    fun `deactivateUser returns false when no active user is found`() {
        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(null)

        val result = userService.deactivateUser(42)

        assertFalse(result)
        verify(userRepository, never()).save(any())
    }

    @Test
    fun `ChangeOwnPassword returns true when current password is right and new passwords match`(){
        val userEntity = testUserEntity(id = 42, password = "old-encoded-password")

        whenever (currentUserService.getCurrentUser()).thenReturn(userEntity.toModel())
        whenever(userRepository.findById(42)).thenReturn(Optional.of(userEntity))
        whenever(passwordEncoder.matches("old-password", "old-encoded-password")).thenReturn(true)
        whenever(passwordEncoder.encode("new-password")).thenReturn("new-encoded-password")
        whenever(userRepository.save(userEntity)).thenReturn(userEntity)

        val result = userService.changeOwnPassword(
            "old-password",
            "new-password",
            "new-password"
        )

        assertTrue(result)
        assertEquals("new-encoded-password", userEntity.password)

        verify(passwordEncoder).matches("old-password", "old-encoded-password")
        verify(passwordEncoder).encode("new-password")
        verify(userRepository).save(userEntity)
    }

    @Test
    fun `changeOwnPassword returns false when current password is wrong`(){
        val userEntity = testUserEntity(id = 42, password = "old-encoded-password")

        whenever (currentUserService.getCurrentUser()).thenReturn(userEntity.toModel())
        whenever(userRepository.findById(42)).thenReturn(Optional.of(userEntity))
        whenever(passwordEncoder.matches("wrong-password", "old-encoded-password")).thenReturn(false)

        val result = userService.changeOwnPassword(
            "wrong-password",
            "new-password",
            "new-password"
        )

        assertFalse(result)

        verify(passwordEncoder).matches("wrong-password", "old-encoded-password")
        verify(passwordEncoder, never()).encode("new-password")
        verify(userRepository, never()).save(userEntity)
    }

    @Test
    fun `changeUserPassword returns true for admin and matching new passwords`(){
        val userEntity = testUserEntity(id = 41, globalRole = GlobalRole.ADMIN.id)
        val targetEntity = testUserEntity(id = 42)

        whenever(currentUserService.getCurrentUser()).thenReturn(userEntity.toModel())
        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(targetEntity)
        whenever(passwordEncoder.encode("new-password")).thenReturn("new-encoded-password")

        val result = userService.changeUserPassword(
            42, "new-password", "new-password"
        )

        assertTrue(result)
        assertEquals("new-encoded-password", targetEntity.password)

        verify(passwordEncoder).encode("new-password")
        verify(userRepository).save(targetEntity)
    }

    @Test
    fun `changeUserPassword returns false when current user is not admin`() {
        val userEntity = testUserEntity(id = 41, globalRole = GlobalRole.USER.id)

        whenever(currentUserService.getCurrentUser()).thenReturn(userEntity.toModel())

        val result = userService.changeUserPassword(
            42, "new-password", "new-password"
        )

        assertFalse(result)

        verify(userRepository, never()).findByIdAndDeletedFalse(42)
        verify(passwordEncoder, never()).encode("new-password")
        verify(userRepository, never()).save(any<UserEntity>())
    }

    @Test
    fun `updateAgreementToPrivacyFor updates privacyChecked`(){
        val userEntity = testUserEntity(id = 42, privacyChecked = false)

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)

        val result = userService.updateAgreementToPrivacyFor(42, true)

        assertTrue(result)
        assertTrue(userEntity.privacyChecked)

        verify(userRepository).findByIdAndDeletedFalse(42)
        verify(userRepository).save(userEntity)
    }

    @Test
    fun `getPrivacyStatusOf returns privacyChecked`(){
        val userEntity = testUserEntity(id = 42, privacyChecked = true)

        whenever(userRepository.findByIdAndDeletedFalse(42)).thenReturn(userEntity)

        val result = userService.getPrivacyStatusOf(42)

        assertTrue(result)

        verify(userRepository).findByIdAndDeletedFalse(42)
    }

    @Test
    fun `findUsers filters by query case insensitive`(){
        val matchingUser = testUserEntity(
            id = 1,
            username = "niklas",
            prename = "Niklas",
            surname = "Test",
            email = "niklas@example.com"
        )

        whenever(userRepository.countUsers(query = "nIkLaS", globalRole = null)).thenReturn(1)

        whenever(userRepository.searchUsers(
                query = "nIkLaS",
                globalRole = null,
                limit = 1,
                offset = 0
            )
        ).thenReturn(listOf(matchingUser))

        val result = userService.findUsers(
            query = "nIkLaS",
            globalRole = null,
            limit = null,
            offset = null
        )

        assertEquals(1, result.totalCount)
        assertEquals(1, result.items.size)
        assertEquals("niklas", result.items.first().username)

        verify(userRepository).countUsers("nIkLaS", null)
        verify(userRepository).searchUsers("nIkLaS", null, 1, 0)
    }

    @Test
    fun `findUsers applies limit and offset`(){

        val user2 = testUserEntity(
            id = 2,
            username = "tom",
            prename = "Tom",
            surname = "Test",
            email = "tom@example.com"
        )

        whenever(userRepository.countUsers(query = null, globalRole = null)).thenReturn(3)

        whenever(userRepository.searchUsers(
            query = null,
            globalRole = null,
            limit = 1,
            offset = 1
        )
        ).thenReturn(listOf(user2))

        val result = userService.findUsers(
            query = null,
            globalRole = null,
            limit = 1,
            offset = 1
        )

        assertEquals(3, result.totalCount)
        assertEquals(1, result.items.size)
        assertEquals("tom", result.items.first().username)

        verify(userRepository).countUsers(null, null)
        verify(userRepository).searchUsers(null, null, 1, 1)
    }

    private fun testUserEntity(
        id: Long = 1,
        prename: String = "Niklas",
        surname: String = "Test",
        email: String? = "niklas@example.com",
        password: String? = "encoded-password",
        username: String = "niklas",
        privacyChecked: Boolean = true,
        deleted: Boolean = false,
        alias: String? = null,
        globalRole: Int = GlobalRole.USER.id
    ) = UserEntity(
        id = id,
        prename = prename,
        surname = surname,
        email = email,
        password = password,
        username = username,
        privacyChecked = privacyChecked,
        deleted = deleted,
        alias = alias,
        globalRole = globalRole
    )
}
