package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.model.app.AppRequiredRole
import de.thm.ii.fbs.fbs_identity_service.model.app.EmbedMode
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.persistence.entity.ApplicationProviderEntity
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.security.principal.IdentityUserPrincipal
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import java.util.Optional
import kotlin.test.assertEquals

class OidcTokenCustomizerTest {

    private val applicationProviderRepository = mock(ApplicationProviderRepository::class.java)

    private val tokenCustomizer =
        OidcTokenConfig(applicationProviderRepository, "fbs-test-client,fbs-web-shell").jwtTokenCustomizer()

    @BeforeEach
    fun setUp() {
        val internalApp = ApplicationProviderEntity(
            id = "course-management",
            title = "Course Management",
            icon = "school",
            url = "http://localhost:8082",
            embedMode = EmbedMode.IFRAME,
            requiredGlobalRole = AppRequiredRole.ALL,
            isInternal = true,
            clientId = "course-management"
        )
        val externalApp = ApplicationProviderEntity(
            id = "open-webui",
            title = "Open WebUI",
            icon = "chat",
            url = "http://localhost:3000",
            embedMode = EmbedMode.EXTERNAL,
            requiredGlobalRole = AppRequiredRole.ALL,
            isInternal = false,
            clientId = "open-webui"
        )

        `when`(applicationProviderRepository.findByClientId("course-management")).thenReturn(internalApp)
        `when`(applicationProviderRepository.findById("course-management")).thenReturn(Optional.of(internalApp))
        `when`(applicationProviderRepository.findByClientId("open-webui")).thenReturn(externalApp)
        `when`(applicationProviderRepository.findById("open-webui")).thenReturn(Optional.of(externalApp))
    }

    @Test
    fun `access token for internal client uses user id as subject`() {
        val principal = createLocalUserPrincipal()

        val authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal,
            null,
            principal.authorities
        )

        val registeredClient = createRegisteredClient("fbs-test-client")
        val claimsBuilder = JwtClaimsSet.builder()

        val context = JwtEncodingContext
            .with(
                JwsHeader.with(SignatureAlgorithm.RS256),
                claimsBuilder
            )
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .principal(authentication)
            .registeredClient(registeredClient)
            .build()

        tokenCustomizer.customize(context)

        val claimsSet = claimsBuilder.build()

        assertEquals("1", claimsSet.subject)
        assertEquals(1L, claimsSet.getClaim("id"))
        assertEquals(1L, claimsSet.getClaim("userId"))
        assertEquals("testUser", claimsSet.getClaim("username"))
        assertEquals("testUser", claimsSet.getClaim("preferred_username"))
        assertEquals("USER", claimsSet.getClaim("globalRole"))
        assertEquals("USER", claimsSet.getClaim("global_role"))
        assertEquals(listOf("ROLE_USER"), claimsSet.getClaim("roles"))
        assertEquals("Max", claimsSet.getClaim("given_name"))
        assertEquals("Mustermann", claimsSet.getClaim("family_name"))
        assertEquals("Max Mustermann", claimsSet.getClaim("name"))
        assertEquals("test@example.org", claimsSet.getClaim("email"))
    }

    @Test
    fun `access token for external client uses username as subject`() {
        val principal = createLocalUserPrincipal()

        val authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal,
            null,
            principal.authorities
        )

        val registeredClient = createRegisteredClient("open-webui")
        val claimsBuilder = JwtClaimsSet.builder()

        val context = JwtEncodingContext
            .with(
                JwsHeader.with(SignatureAlgorithm.RS256),
                claimsBuilder
            )
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .principal(authentication)
            .registeredClient(registeredClient)
            .build()

        tokenCustomizer.customize(context)

        val claimsSet = claimsBuilder.build()

        assertEquals("testUser", claimsSet.subject)
        assertEquals(1L, claimsSet.getClaim("id"))
        assertEquals(1L, claimsSet.getClaim("userId"))
        assertEquals("testUser", claimsSet.getClaim("username"))
        assertEquals("testUser", claimsSet.getClaim("preferred_username"))
        assertEquals("USER", claimsSet.getClaim("globalRole"))
        assertEquals("USER", claimsSet.getClaim("global_role"))
        assertEquals(listOf("ROLE_USER"), claimsSet.getClaim("roles"))
        assertEquals("Max", claimsSet.getClaim("given_name"))
        assertEquals("Mustermann", claimsSet.getClaim("family_name"))
        assertEquals("Max Mustermann", claimsSet.getClaim("name"))
        assertEquals("test@example.org", claimsSet.getClaim("email"))
    }

    @Test
    fun `id token contains user profile claims and user id`() {
        val principal = createLocalUserPrincipal()

        val authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal,
            null,
            principal.authorities
        )

        val registeredClient = createRegisteredClient("open-webui")
        val claimsBuilder = JwtClaimsSet.builder()

        val context = JwtEncodingContext
            .with(
                JwsHeader.with(SignatureAlgorithm.RS256),
                claimsBuilder
            )
            .tokenType(
                OAuth2TokenType(OidcParameterNames.ID_TOKEN)
            )
            .principal(authentication)
            .registeredClient(registeredClient)
            .build()

        tokenCustomizer.customize(context)

        val claimsSet = claimsBuilder.build()

        assertEquals("testUser", claimsSet.subject)
        assertEquals(1L, claimsSet.getClaim("id"))
        assertEquals(1L, claimsSet.getClaim("userId"))
        assertEquals("testUser", claimsSet.getClaim("username"))
        assertEquals("testUser", claimsSet.getClaim("preferred_username"))
        assertEquals("USER", claimsSet.getClaim("globalRole"))
        assertEquals("Max", claimsSet.getClaim("given_name"))
        assertEquals("Mustermann", claimsSet.getClaim("family_name"))
        assertEquals("Max Mustermann", claimsSet.getClaim("name"))
        assertEquals("test@example.org", claimsSet.getClaim("email"))
    }

    private fun createRegisteredClient(clientId: String): RegisteredClient {
        return RegisteredClient.withId(clientId)
            .clientId(clientId)
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("http://localhost/callback")
            .build()
    }

    private fun createLocalUserPrincipal(): IdentityUserPrincipal {
        return IdentityUserPrincipal(
            userId = 1L,
            username = "testUser",
            password = "encoded-password",
            globalRole = GlobalRole.USER,
            authorities = listOf(
                SimpleGrantedAuthority("ROLE_USER")
            ),
            prename = "Max",
            surname = "Mustermann",
            email = "test@example.org"
        )
    }
}

