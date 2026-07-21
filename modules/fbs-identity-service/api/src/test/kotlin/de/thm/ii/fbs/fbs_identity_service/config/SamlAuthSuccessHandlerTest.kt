package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.dto.login.LoginResponse
import de.thm.ii.fbs.fbs_identity_service.model.auth.SamlUser
import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import de.thm.ii.fbs.fbs_identity_service.model.user.User
import de.thm.ii.fbs.fbs_identity_service.security.local.IdentityUserPrincipal
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.FrontendRedirectService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlLoginService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlRouteService
import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlSessionCleanupService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.saml2.core.Saml2ParameterNames
import org.springframework.security.saml2.provider.service.authentication.DefaultSaml2AuthenticatedPrincipal
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.security.web.savedrequest.HttpSessionRequestCache
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class SamlAuthSuccessHandlerTest {

    private val samlLoginService = mock<SamlLoginService>()

    private val samlSessionCleanupService = mock<SamlSessionCleanupService>()

    private val frontendRedirectService = FrontendRedirectService("https://localhost")

    private val routeService = mock<SamlRouteService>()

    private val securityContextRepository = mock<SecurityContextRepository>()

    private val handler = SamlAuthSuccessHandler(
        samlLoginService = samlLoginService,
        frontendRedirectService = frontendRedirectService,
        samlSessionCleanupService = samlSessionCleanupService,
        routeService = routeService,
        securityContextRepository = securityContextRepository,
        principalAttribute = "uid",
        prenameAttribute = "givenName",
        surnameAttribute = "sn",
        emailAttribute = "mail",
        jwtCookieName = "jwt",
        jwtCookieMaxAgeSeconds = 30,
        successPath = "/login",
        failurePath = "/login?ssoError=1",
    )

    @Test
    fun `onAuthenticationSuccess sets jwt cookie clears session and redirects to frontend success path`() {
        whenever(samlLoginService.login(any())).thenReturn(
            LoginResponse(
                accessToken = "jwt-token",
                tokenType = "Bearer",
                expiresIn = 3600
            )
        )

        val principal = DefaultSaml2AuthenticatedPrincipal(
            "niklas",
            mapOf<String, List<Any>>(
                "uid" to listOf("niklas"),
                "givenName" to listOf("Niklas"),
                "sn" to listOf("Euler"),
                "mail" to listOf("niklas@example.com")
            )
        )

        val authentication = mock<Authentication>()
        whenever(authentication.principal).thenReturn(principal)

        whenever(routeService.sanitize(null)).thenReturn(null)

        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        handler.onAuthenticationSuccess(request, response, authentication)

        assertEquals(302, response.status)
        assertEquals("https://localhost/login", response.redirectedUrl)

        val setCookieHeaders = response.getHeaders(HttpHeaders.SET_COOKIE)

        assertTrue(
            setCookieHeaders.any {
                it.startsWith("jwt=jwt-token") &&
                        it.contains("Max-Age=30") &&
                        it.contains("Path=/") &&
                        it.contains("SameSite=Lax")
            }
        )

        verify(samlSessionCleanupService).clearSession(request, response)

        val samlUserCaptor = argumentCaptor<SamlUser>()
        verify(samlLoginService).login(samlUserCaptor.capture())

        val samlUser = samlUserCaptor.firstValue
        assertEquals("niklas", samlUser.username)
        assertEquals("Niklas", samlUser.prename)
        assertEquals("Euler", samlUser.surname)
        assertEquals("niklas@example.com", samlUser.email)
    }

    @Test
    fun `onAuthenticationSuccess redirects to failure path when required principal attribute is missing`() {
        val principal = DefaultSaml2AuthenticatedPrincipal(
            "niklas",
            mapOf<String, List<Any>>(
                "givenName" to listOf("Niklas"),
                "sn" to listOf("Euler"),
                "mail" to listOf("niklas@example.com")
            )
        )

        val authentication = mock<Authentication>()
        whenever(authentication.principal).thenReturn(principal)

        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        handler.onAuthenticationSuccess(request, response, authentication)

        assertEquals(302, response.status)
        assertEquals("https://localhost/login?ssoError=1", response.redirectedUrl)

        verify(samlLoginService, never()).login(any())
        verify(samlSessionCleanupService).clearSession(request, response)
    }

    @Test
    fun `onAuthenticationSuccess adds sanitized RelayState route to frontend redirect`() {
        whenever(samlLoginService.login(any())).thenReturn(
            LoginResponse(
                accessToken = "jwt-token",
                tokenType = "Bearer",
                expiresIn = 3600
            )
        )

        val principal = DefaultSaml2AuthenticatedPrincipal(
            "niklas",
            mapOf<String, List<Any>>(
                "uid" to listOf("niklas"),
                "givenName" to listOf("Niklas"),
                "sn" to listOf("Euler"),
                "mail" to listOf("niklas@example.com")
            )
        )

        val authentication = mock<Authentication>()
        whenever(authentication.principal).thenReturn(principal)

        whenever(routeService.sanitize("/groups")).thenReturn("/groups")

        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        request.addParameter(Saml2ParameterNames.RELAY_STATE, "/groups")

        handler.onAuthenticationSuccess(request, response, authentication)

        assertEquals(302, response.status)
        assertEquals("https://localhost/login?route=/groups", response.redirectedUrl)

        verify(samlSessionCleanupService).clearSession(request, response)
        verify(routeService).sanitize("/groups")
    }

    @Test
    fun `onAuthenticationSuccess continues oidc flow for saved authorization request`() {
        val principal = DefaultSaml2AuthenticatedPrincipal(
            "niklas",
            mapOf<String, List<Any>>(
                "uid" to listOf("niklas"),
                "givenName" to listOf("Niklas"),
                "sn" to listOf("Euler"),
                "mail" to listOf("niklas@example.com")
            )
        )

        val samlAuthentication = mock<Authentication>()
        whenever(samlAuthentication.principal).thenReturn(principal)

        val user = mock<User>()
        whenever(user.id).thenReturn(1L)
        whenever(user.username).thenReturn("niklas")
        whenever(user.globalRole).thenReturn(GlobalRole.USER)

        whenever(samlLoginService.resolveUser(any())).thenReturn(user)

        val mockSession = MockHttpSession()

        val authorizationRequest =
            MockHttpServletRequest().apply {
                requestURI = "/oauth2/authorize"
                queryString = "response_type=code&client_id=fbs-test-client"
                setSession(mockSession)
            }

        HttpSessionRequestCache().saveRequest(authorizationRequest, MockHttpServletResponse())

        val request = MockHttpServletRequest().apply {
            setSession(mockSession)
        }

        val response = MockHttpServletResponse()

        handler.onAuthenticationSuccess(
            request,
            response,
            samlAuthentication
        )

        assertEquals(302, response.status)

        assertTrue(response.redirectedUrl?.contains("/oauth2/authorize") == true)

        val securityContextCaptor = argumentCaptor<SecurityContext>()

        verify(securityContextRepository).saveContext(
            securityContextCaptor.capture(),
            eq(request),
            eq(response)
        )

        val securityContext = securityContextCaptor.firstValue

        assertTrue(securityContext.authentication.isAuthenticated)
        assertTrue(securityContext.authentication.principal is IdentityUserPrincipal)

        val identityPrincipal = securityContext.authentication.principal as IdentityUserPrincipal

        assertEquals(1L, identityPrincipal.userId)
        assertEquals("niklas", identityPrincipal.username)
        assertEquals(GlobalRole.USER, identityPrincipal.globalRole)

        verify(samlLoginService).resolveUser(any())

        verify(samlLoginService, never()).login(any())

        verify(samlSessionCleanupService, never()).clearSession(any(), any())
    }
}
