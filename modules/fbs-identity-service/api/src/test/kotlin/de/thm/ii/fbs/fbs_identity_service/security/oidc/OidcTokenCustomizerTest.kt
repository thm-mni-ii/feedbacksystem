package de.thm.ii.fbs.fbs_identity_service.security.oidc

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.security.principal.IdentityUserPrincipal
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import kotlin.test.assertEquals
import kotlin.test.assertNull

class OidcTokenCustomizerTest {

    private val tokenCustomizer =
        OidcTokenConfig().jwtTokenCustomizer()

    @Test
    fun `access token contains local user claims`() {
        val principal = createLocalUserPrincipal()

        val authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal,
            null,
            principal.authorities
        )

        val claimsBuilder = JwtClaimsSet.builder()

        val context = JwtEncodingContext
            .with(
                JwsHeader.with(SignatureAlgorithm.RS256),
                claimsBuilder
            )
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .principal(authentication)
            .build()

        tokenCustomizer.customize(context)

        val claimsSet = claimsBuilder.build()

        assertEquals("1", claimsSet.subject)
        assertEquals(1L, claimsSet.getClaim("id"))
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
    fun `id token contains user profile claims`() {
        val principal = createLocalUserPrincipal()

        val authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal,
            null,
            principal.authorities
        )

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
            .build()

        tokenCustomizer.customize(context)

        val claimsSet = claimsBuilder.build()

        assertEquals("1", claimsSet.subject)
        assertEquals("testUser", claimsSet.getClaim("preferred_username"))
        assertEquals("Max", claimsSet.getClaim("given_name"))
        assertEquals("Mustermann", claimsSet.getClaim("family_name"))
        assertEquals("Max Mustermann", claimsSet.getClaim("name"))
        assertEquals("test@example.org", claimsSet.getClaim("email"))
        assertNull(claimsSet.getClaim("username"))
        assertNull(claimsSet.getClaim("globalRole"))
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
