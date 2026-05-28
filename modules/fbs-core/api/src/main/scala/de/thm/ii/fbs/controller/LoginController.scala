package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{ForbiddenException, UnauthorizedException}
import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.services.persistence.UserService
import de.thm.ii.fbs.services.security.{AuthService, LdapService, LocalLoginService, SamlService, SamlUser, SingleSignOnService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper

import javax.servlet.http.{Cookie, HttpServletRequest, HttpServletResponse}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

/**
  * LoginController simply perform login request.
  */
@RestController
@RequestMapping(path = Array("/api/v1/login"))
class LoginController {
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val loginService: LocalLoginService = null
  @Autowired
  private val ldapService: LdapService = null
  @Autowired
  private val singleSignOnService: SingleSignOnService = null
  @Autowired(required = false)
  private val samlService: SamlService = null

  @Value("${ldap.attributeNames.uid}")
  private val uidAttributeName: String = null
  @Value("${ldap.attributeNames.sn}")
  private val snAttributeName: String = null
  @Value("${ldap.attributeNames.name}")
  private val nameAttributeName: String = null
  @Value("${ldap.attributeNames.mail}")
  private val mailAttributeName: String = null
  @Value("${ldap.allowLogin}")
  private val allowLdapLogin: Boolean = false

  private val logger = LoggerFactory.getLogger(this.getClass)
  /**
    * Authentication starts here via the configured single sign-on provider.
    *
    * This Webservice sends user to the configured provider to perform a login. The provider redirects to this point and
    * here a answer to a connected Application (i.e. Angular) will be sent
    *
    * @author Benjamin Manns
    * @param route requested route by user, has to be forwarded to the Angular App
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @return Java Map
    */
  @RequestMapping(value = Array("/sso"), method = Array(RequestMethod.GET))
  def userLogin(@RequestParam(value = "route", required = false) route: String, request: HttpServletRequest,
                response: HttpServletResponse): Unit = {
    handleSingleSignOnLogin(route, request, response, allowRedirectToProvider = true)
  }

  /**
    * Legacy alias for externally protected callbacks that still point to the historic CAS endpoint.
    */
  @RequestMapping(value = Array("/cas"), method = Array(RequestMethod.GET))
  def userCasLogin(@RequestParam(value = "route", required = false) route: String, request: HttpServletRequest,
                   response: HttpServletResponse): Unit = {
    handleSingleSignOnLogin(route, request, response, allowRedirectToProvider = false)
  }

  private def handleSingleSignOnLogin(route: String, request: HttpServletRequest, response: HttpServletResponse,
                                      allowRedirectToProvider: Boolean): Unit = {
    try {
      singleSignOnService.resolvePrincipal(request) match {
        case Some(username) => authenticateExternalUser(username, route, response)
        case None if allowRedirectToProvider =>
          singleSignOnService.buildLoginRedirect(route) match {
            case Some(loginRedirect) =>
              redirect(response, loginRedirect)
            case None =>
              logger.warn("No principal returned from the configured single sign-on provider and no login URL is configured")
              redirect(response, singleSignOnService.buildFailureRedirect(route))
          }
        case None =>
          logger.warn("No principal returned from the configured single sign-on provider")
          redirect(response, singleSignOnService.buildFailureRedirect(route))
      }
    } catch {
      case e: Throwable =>
        logger.error("Error: ", e)
        redirect(response, singleSignOnService.buildFailureRedirect(route))
    }
  }

  private def authenticateExternalUser(username: String, route: String, response: HttpServletResponse,
                                       samlUser: Option[SamlUser] = None): Unit = {
    val authenticatedUser = userService.findActive(username)
      .orElse(loadUserFromLdap(username).map(u => userService.create(u, null)))
      .orElse(samlUser.map(su => userService.create(
        new User(su.prename, su.surname, su.email, su.username, GlobalRole.USER), null)))

    authenticatedUser match {
      case Some(user) =>
        issueJwtCookie(user, response)
        redirect(response, singleSignOnService.buildSuccessRedirect(route))
      case None =>
        logger.warn(s"Could not provision an application user for external principal '$username'")
        redirect(response, singleSignOnService.buildFailureRedirect(route))
    }
  }

  private def issueJwtCookie(user: User, response: HttpServletResponse): Unit = {
    val token = authService.createToken(user)
    userService.updateLastLogin(user.id)

    val jwtCookie = new Cookie("jwt", token)
    jwtCookie.setPath("/")
    jwtCookie.setHttpOnly(false)
    jwtCookie.setMaxAge(30)
    response.addCookie(jwtCookie)

    val sessionCookie = new Cookie("JSESSIONID", "")
    sessionCookie.setPath("/")
    sessionCookie.setHttpOnly(true)
    sessionCookie.setSecure(true)
    sessionCookie.setMaxAge(0)
    response.addCookie(sessionCookie)
  }

  private def redirect(response: HttpServletResponse, location: String): Unit = {
    response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY)
    response.setHeader("Location", location)
  }

  private def loadUserFromLdap(uid: String): Option[User] =
    ldapService.getEntryByUid(uid)
      .map(entry => new User(
      entry.getAttribute(nameAttributeName).getStringValue,
      entry.getAttribute(snAttributeName).getStringValue,
      entry.getAttribute(mailAttributeName).getStringValue,
      entry.getAttribute(uidAttributeName).getStringValue,
      GlobalRole.USER))

  /**
    * Login via LDAP
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @RequestMapping(value = Array("/ldap"), method = Array(RequestMethod.POST))
  def userLDAPLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    if (allowLdapLogin) {
      val login = for {
        username <- jsonNode.retrive("username").asText()
        password <- jsonNode.retrive("password").asText()
        ldapUser <- ldapService.login(username, password)
        user <- loadUserFromLdap(ldapUser.getAttribute("uid").getStringValue)
      } yield user

      login match {
        case Some((user)) =>
          val localUser = userService.find(user.username).getOrElse(userService.create(user, null))
          authService.renewAuthentication(localUser, response)
        case None => throw new UnauthorizedException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Login via local database.
    *
    * @param request  Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @RequestMapping(value = Array("/local"), method = Array(RequestMethod.POST))
  def userLocalLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val login = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
      user <- loginService.login(username, password)
    } yield user

    login match {
      case Some(user) => authService.renewAuthentication(user, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Login via local database or ldap.
    * @param request Http request gives access to the http request information.
    * @param response HTTP Answer (contains also cookies)
    * @param jsonNode Request Body of User login
    */
  @RequestMapping(value = Array("/unified"), method = Array(RequestMethod.POST))
  def userUnifiedLogin(request: HttpServletRequest, response: HttpServletResponse, @RequestBody jsonNode: JsonNode): Unit = {
    val credentials = for {
      username <- jsonNode.retrive("username").asText()
      password <- jsonNode.retrive("password").asText()
    } yield (username, password)

    val user = credentials.flatMap(creds =>
        loginService.login(creds._1, creds._2).orElse(if (allowLdapLogin) {for {
            ldapLogin <- ldapService.login(creds._1, creds._2)
            ldapUser <- loadUserFromLdap(ldapLogin.getAttribute(uidAttributeName).getStringValue)
              .map(user => userService.find(user.username).getOrElse(userService.create(user, null)))
          } yield ldapUser} else {None})
    )

    user match {
      case Some(user) => authService.renewAuthentication(user, response)
      case None => throw new UnauthorizedException()
    }
  }

  /**
    * Returns the SAML SP metadata XML.
    *
    * The IdP must import this metadata to trust the SP.
    * URL: GET /api/v1/login/saml/metadata
    */
  @RequestMapping(value = Array("/saml/metadata"), method = Array(RequestMethod.GET),
    produces = Array("application/samlmetadata+xml", MediaType.APPLICATION_XML_VALUE))
  def samlMetadata(): ResponseEntity[String] = {
    if (samlService == null) {
      ResponseEntity.status(503).body("SAML is not enabled (set saml.enabled=true)")
    } else {
      ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/samlmetadata+xml"))
        .body(samlService.buildMetadataXml())
    }
  }

  /**
    * SAML Assertion Consumer Service (ACS) endpoint.
    *
    * The IdP POSTs the SAMLResponse here after the user authenticates.
    * RelayState carries the frontend route to redirect to after login.
    *
    * URL: POST /api/v1/login/saml/acs
    */
  @RequestMapping(value = Array("/saml/acs"), method = Array(RequestMethod.POST))
  def samlAcs(
    @RequestParam(value = "SAMLResponse", required = true) samlResponse: String,
    @RequestParam(value = "RelayState", required = false) relayState: String,
    request: HttpServletRequest,
    response: HttpServletResponse
  ): Unit = {
    if (samlService == null) {
      redirect(response, singleSignOnService.buildFailureRedirect(relayState))
    } else {
      try {
        samlService.extractUser(samlResponse, request) match {
          case Some(samlUser) => authenticateExternalUser(samlUser.username, relayState, response, Some(samlUser))
          case None =>
            logger.warn("SAML ACS: could not extract principal from SAMLResponse")
            redirect(response, singleSignOnService.buildFailureRedirect(relayState))
        }
      } catch {
        case e: Throwable =>
          logger.error("SAML ACS error", e)
          redirect(response, singleSignOnService.buildFailureRedirect(relayState))
      }
    }
  }

  /**
    * Renews the token of the user
    * @param req Http Request
    * @param res Http Response
    */
  @RequestMapping(value = Array("/token"), method = Array(RequestMethod.GET))
  def renew(req: HttpServletRequest, res: HttpServletResponse): Unit = {
    authService.authorize(req, res);
  }
}
