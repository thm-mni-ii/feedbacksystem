package de.thm.ii.fbs.fbs_identity_service.service.auth

import com.nimbusds.jose.jwk.gen.RSAKeyGenerator
import com.nimbusds.jwt.SignedJWT
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeRequest
import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

class TokenExchangeServiceTest {

    private val currentUserService: CurrentUserService = mock()
    private val applicationProviderRepository: ApplicationProviderRepository = mock()
    private val rsaKey = RSAKeyGenerator(2048).keyID("test-key-id").generate()

    private lateinit var tokenExchangeService: TokenExchangeService

    @BeforeEach
    fun setup() {
        tokenExchangeService = TokenExchangeService(
            currentUserService = currentUserService,
            applicationProviderRepository = applicationProviderRepository,
            rsaKey = rsaKey,
            configuredIssuer = "http://localhost:8080",
            configuredClientIds = "fbs-web-shell,course-management",
            accessTokenTtlMinutes = 15
        )
    }

    private fun testUser(role: GlobalRole = GlobalRole.USER): User {
        return User(
            id = 42,
            username = "maxmustermann",
            email = "max@thm.de",
            prename = "Max",
            surname = "Mustermann",
            alias = "max",
            globalRole = role
        )
    }

    private fun testProviderEntity(
        id: String = "sql-playground",
        requiredRole: AppRequiredRole = AppRequiredRole.USER,
        active: Boolean = true,
        internal: Boolean = true
    ): ApplicationProviderEntity {
        return ApplicationProviderEntity(
            id = id,
            title = "SQL Playground",
            description = "Interactive SQL",
            url = "http://sql-playground:80",
            icon = "mdi-database",
            embedMode = EmbedMode.IFRAME,
            navbarPosition = 2,
            requiredGlobalRole = requiredRole,
            isActive = active,
            isInternal = internal
        )
    }

    @Test
    fun `successfully exchanges token for valid registered audience`() {
        val user = testUser()
        val provider = testProviderEntity("sql-playground")

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("sql-playground")).thenReturn(Optional.of(provider))

        val response = tokenExchangeService.exchangeToken(TokenExchangeRequest("sql-playground"))

        assertNotNull(response.accessToken)
        assertEquals("Bearer", response.tokenType)
        assertEquals(900, response.expiresIn)
        assertEquals("sql-playground", response.audience)

        val jwt = SignedJWT.parse(response.accessToken)
        assertEquals("http://localhost:8080", jwt.jwtClaimsSet.issuer)
        assertEquals("42", jwt.jwtClaimsSet.subject)
        assertEquals(listOf("sql-playground"), jwt.jwtClaimsSet.audience)
        assertEquals("maxmustermann", jwt.jwtClaimsSet.getClaim("username"))
        assertEquals("USER", jwt.jwtClaimsSet.getClaim("globalRole"))
        assertEquals("Max Mustermann", jwt.jwtClaimsSet.getClaim("name"))
        assertEquals("max@thm.de", jwt.jwtClaimsSet.getClaim("email"))
    }

    @Test
    fun `successfully exchanges token for base internal client when provider entity not found`() {
        val user = testUser()

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("course-management")).thenReturn(Optional.empty())
        whenever(applicationProviderRepository.findByClientId("course-management")).thenReturn(null)

        val response = tokenExchangeService.exchangeToken(TokenExchangeRequest("course-management"))

        assertNotNull(response.accessToken)
        assertEquals("course-management", response.audience)

        val jwt = SignedJWT.parse(response.accessToken)
        assertEquals("42", jwt.jwtClaimsSet.subject)
        assertEquals(listOf("course-management"), jwt.jwtClaimsSet.audience)
    }

    @Test
    fun `throws 401 when current user is not authenticated`() {
        whenever(currentUserService.getCurrentUser()).thenReturn(null)

        val exception = assertThrows<ResponseStatusException> {
            tokenExchangeService.exchangeToken(TokenExchangeRequest("sql-playground"))
        }
        assertEquals(401, exception.statusCode.value())
    }

    @Test
    fun `throws 404 when target audience is unknown`() {
        val user = testUser()
        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("unknown-app")).thenReturn(Optional.empty())
        whenever(applicationProviderRepository.findByClientId("unknown-app")).thenReturn(null)

        val exception = assertThrows<ResponseStatusException> {
            tokenExchangeService.exchangeToken(TokenExchangeRequest("unknown-app"))
        }
        assertEquals(404, exception.statusCode.value())
    }

    @Test
    fun `throws 403 when provider is inactive`() {
        val user = testUser()
        val provider = testProviderEntity("disabled-app", active = false)

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("disabled-app")).thenReturn(Optional.of(provider))

        val exception = assertThrows<ResponseStatusException> {
            tokenExchangeService.exchangeToken(TokenExchangeRequest("disabled-app"))
        }
        assertEquals(403, exception.statusCode.value())
    }

    @Test
    fun `throws 403 when user lacks required global role`() {
        val user = testUser(GlobalRole.USER)
        val provider = testProviderEntity("admin-tool", requiredRole = AppRequiredRole.ADMIN)

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("admin-tool")).thenReturn(Optional.of(provider))

        val exception = assertThrows<ResponseStatusException> {
            tokenExchangeService.exchangeToken(TokenExchangeRequest("admin-tool"))
        }
        assertEquals(403, exception.statusCode.value())
    }

    @Test
    fun `external provider uses username as subject`() {
        val user = testUser()
        val provider = testProviderEntity("external-app", internal = false)

        whenever(currentUserService.getCurrentUser()).thenReturn(user)
        whenever(applicationProviderRepository.findById("external-app")).thenReturn(Optional.of(provider))

        val response = tokenExchangeService.exchangeToken(TokenExchangeRequest("external-app"))
        val jwt = SignedJWT.parse(response.accessToken)

        assertEquals("maxmustermann", jwt.jwtClaimsSet.subject)
    }
}
