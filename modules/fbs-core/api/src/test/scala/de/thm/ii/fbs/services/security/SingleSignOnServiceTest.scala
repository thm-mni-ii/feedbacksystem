package de.thm.ii.fbs.services.security

import java.security.Principal

import org.junit.{Assert, Test}
import org.springframework.mock.web.MockHttpServletRequest

class SingleSignOnServiceTest {
  private val service = new SingleSignOnService(
    "https://feedback.example",
    "https://idp.example/login",
    "target",
    "X-Forwarded-User,SM_USER",
    "/login",
    "/login?ssoError=1"
  )

  @Test
  def resolvePrincipalUsesServletPrincipalFirst(): Unit = {
    val request = new MockHttpServletRequest
    request.setUserPrincipal(new Principal {
      override def getName: String = "alice"
    })
    request.addHeader("SM_USER", "bob")

    Assert.assertEquals(Some("alice"), service.resolvePrincipal(request))
  }

  @Test
  def resolvePrincipalFallsBackToConfiguredHeaders(): Unit = {
    val request = new MockHttpServletRequest
    request.addHeader("SM_USER", "bob")

    Assert.assertEquals(Some("bob"), service.resolvePrincipal(request))
  }

  @Test
  def buildLoginRedirectIncludesEncodedCallbackRoute(): Unit = {
    val redirect = service.buildLoginRedirect("/courses/7").get

    Assert.assertTrue(redirect.startsWith("https://idp.example/login?target="))
    Assert.assertTrue(redirect.contains("api/v1/login/sso"))
    Assert.assertTrue(redirect.contains("route"))
    Assert.assertTrue(redirect.contains("/courses/7"))
  }

  @Test
  def buildSuccessRedirectUsesLoginPageAndRoute(): Unit = {
    val redirect = service.buildSuccessRedirect("/courses/7")

    Assert.assertEquals("https://feedback.example/login?route=/courses/7", redirect)
  }

  @Test
  def buildFailureRedirectRejectsExternalRoutes(): Unit = {
    val redirect = service.buildFailureRedirect("https://evil.example")

    Assert.assertEquals("https://feedback.example/login?ssoError=1", redirect)
  }
}
