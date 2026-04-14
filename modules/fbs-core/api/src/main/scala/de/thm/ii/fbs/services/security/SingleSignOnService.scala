package de.thm.ii.fbs.services.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

import javax.servlet.http.HttpServletRequest

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
  private val failureUrl: String
) {
  private val principalHeaders = principalHeaderNames
    .split(",")
    .map(_.trim)
    .filter(_.nonEmpty)
    .toSeq

  def resolvePrincipal(request: HttpServletRequest): Option[String] =
    nonBlank(Option(request.getUserPrincipal).map(_.getName))
      .orElse(nonBlank(Option(request.getRemoteUser)))
      .orElse(principalHeaders.view
        .map(headerName => nonBlank(Option(request.getHeader(headerName))))
        .collectFirst { case Some(value) => value })

  def buildLoginRedirect(route: String): Option[String] =
    nonBlank(Option(loginUrl)).map(url => {
      val builder = UriComponentsBuilder.fromUriString(toAbsoluteClientUrl(url))

      nonBlank(Option(returnUrlParameter))
        .foreach(param => builder.replaceQueryParam(param, buildCallbackUrl(route)))

      builder.build().encode().toUriString
    })

  def buildSuccessRedirect(route: String): String =
    buildFrontendRedirect(successUrl, route)

  def buildFailureRedirect(route: String): String =
    buildFrontendRedirect(failureUrl, route)

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

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      trimmed
    } else {
      s"${clientHostUrl.stripSuffix("/")}/${trimmed.stripPrefix("/")}"
    }
  }

  private def nonBlank(value: Option[String]): Option[String] =
    value.map(_.trim).filter(_.nonEmpty)
}
