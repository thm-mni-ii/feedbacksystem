package de.thm.ii.fbs.services.security

import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

import javax.servlet.http.HttpServletRequest

/**
  * Orchestrates the SSO login flow.
  *
  * When SAML is enabled (`saml.enabled=true`), `buildLoginRedirect` produces a proper
  * SAML HTTP-Redirect binding AuthnRequest via [[SamlService]].
  *
  * When SAML is disabled (the old header-injection path), `buildLoginRedirect` falls back
  * to the legacy SSO_LOGIN_URL + ReturnTo redirect if `sso.login-url` is set.
  *
  * Principal resolution order (used after ACS callback or header injection):
  *   1. Servlet container principal (request.getUserPrincipal)
  *   2. REMOTE_USER
  *   3. Configured HTTP headers (SSO_PRINCIPAL_HEADER_NAMES)
  */
@Component
class SingleSignOnService(
  @Value("${sso.client-host-url}")
  private val clientHostUrl: String,
  @Value("${sso.login-url:}")
  private val loginUrl: String,
  @Value("${sso.return-url-parameter:}")
  private val returnUrlParameter: String,
  @Value("${sso.principal-header-names:X-Forwarded-User,Remote-User,SM_USER,eppn}")
  private val principalHeaderNames: String,
  @Value("${sso.success-url:/login}")
  private val successUrl: String,
  @Value("${sso.failure-url:/login?ssoError=1}")
  private val failureUrl: String,
  @Value("${saml.enabled:false}")
  private val samlEnabled: Boolean
) {
  @Autowired(required = false)
  private val samlService: SamlService = null

  private val principalHeaders = principalHeaderNames
    .split(",")
    .map(_.trim)
    .filter(_.nonEmpty)
    .toSeq

  // -------------------------------------------------------------------------
  // Principal resolution — called after a successful SSO callback
  // -------------------------------------------------------------------------

  def resolvePrincipal(request: HttpServletRequest): Option[String] =
    nonBlank(Option(request.getUserPrincipal).map(_.getName))
      .orElse(nonBlank(Option(request.getRemoteUser)))
      .orElse(principalHeaders.view
        .map(headerName => nonBlank(Option(request.getHeader(headerName))))
        .collectFirst { case Some(value) => value })

  // -------------------------------------------------------------------------
  // Redirect to IdP
  // -------------------------------------------------------------------------

  /**
    * Builds the redirect URL that sends the browser to the IdP to authenticate.
    *
    * When SAML is enabled: produces a proper SAML AuthnRequest redirect.
    * When SAML is disabled: falls back to the legacy `sso.login-url` + ReturnTo approach.
    *
    * @param route the frontend route to return to after login (encoded as RelayState / ReturnTo)
    * @return Some(url) if an IdP redirect can be built, None otherwise
    */
  def buildLoginRedirect(route: String): Option[String] = {
    if (samlEnabled && samlService != null) {
      val relayState = Option(route).map(_.trim).filter(_.nonEmpty).getOrElse("/")
      Some(samlService.buildAuthnRequestRedirectUrl(relayState))
    } else {
      nonBlank(Option(loginUrl)).map(url => {
        val builder = UriComponentsBuilder.fromUriString(toAbsoluteClientUrl(url))
        nonBlank(Option(returnUrlParameter))
          .foreach(param => builder.replaceQueryParam(param, buildCallbackUrl(route)))
        builder.build().encode().toUriString
      })
    }
  }

  // -------------------------------------------------------------------------
  // Post-login redirects back to the frontend
  // -------------------------------------------------------------------------

  def buildSuccessRedirect(route: String): String =
    buildFrontendRedirect(successUrl, route)

  def buildFailureRedirect(route: String): String =
    buildFrontendRedirect(failureUrl, route)

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private def buildCallbackUrl(route: String): String = {
    val builder = UriComponentsBuilder.fromUriString(toAbsoluteClientUrl("/api/v1/login/sso"))
    sanitizeRoute(route).foreach(validRoute => builder.replaceQueryParam("route", validRoute))
    builder.build().encode().toUriString
  }

  private def buildFrontendRedirect(path: String, route: String): String = {
    val builder = UriComponentsBuilder.fromUriString(toAbsoluteClientUrl(path))
    sanitizeRoute(route).foreach(validRoute => builder.replaceQueryParam("route", validRoute))
    builder.build().encode().toUriString
  }

  private def sanitizeRoute(route: String): Option[String] =
    nonBlank(Option(route))
      .filter(_.startsWith("/"))
      .filterNot(_.startsWith("//"))

  private def toAbsoluteClientUrl(pathOrUrl: String): String = {
    val trimmed = pathOrUrl.trim
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) { trimmed }
    else { s"${clientHostUrl.stripSuffix("/")}/${trimmed.stripPrefix("/")}" }
  }

  private def nonBlank(value: Option[String]): Option[String] =
    value.map(_.trim).filter(_.nonEmpty)
}
