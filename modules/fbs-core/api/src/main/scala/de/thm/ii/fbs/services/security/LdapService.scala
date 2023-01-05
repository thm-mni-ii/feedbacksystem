package de.thm.ii.fbs.services.security

import org.ldaptive.{BindConnectionInitializer, ConnectionConfig, Credential, DefaultConnectionFactory, FilterTemplate, LdapEntry, SearchOperation}
import org.ldaptive.auth.{AuthenticationRequest, Authenticator, SearchDnResolver, SimpleBindAuthenticationHandler}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class LdapService(
  @Value("${ldap.enabled}")
  private val enabled: Boolean,
  @Value("${ldap.url}")
  private val ldapUrl: String,
  @Value("${ldap.baseDn}")
  private val baseDn: String,
  @Value("${ldap.startTls}")
  private val useStartTls: Boolean,
  @Value("${ldap.filter}")
  private val ldapFilter: String,
  @Value("${ldap.bind.enabled}")
  private val bindingEnabled: Boolean,
  @Value("${ldap.bind.dn}")
  private val bindingDn: String,
  @Value("${ldap.bind.password}")
  private val bindingPassword: String,
 ) {
  private val connectionFactory = createConnectionFactory()

  def login(username: String, password: String): Option[LdapEntry] = runWithConnectionFactory(connectionFactory => {
    val dnResolver = SearchDnResolver.builder
      .factory(connectionFactory)
      .dn(baseDn)
      .filter(ldapFilter)
      .subtreeSearch(true)
      .build

    val authHandler = new SimpleBindAuthenticationHandler(connectionFactory)
    val auth = new Authenticator(dnResolver, authHandler)
    val response = auth.authenticate(new AuthenticationRequest(username, new Credential(password), "uid"))
    if (!response.isSuccess) {
      None
    } else {
      Some(response.getLdapEntry)
    }
  })

  def getEntryByUid(uid: String): Option[LdapEntry] = runWithConnectionFactory(connectionFactory => {
    val search = new SearchOperation(connectionFactory, baseDn)
    val result = search.execute(
      FilterTemplate.builder()
        .filter(ldapFilter)
        .parameter("user", uid)
        .build(),
      "uid", "sn", "givenName", "mail"
    )
    Option(result.getEntry)
  })

  private def createConnectionFactory(): Option[DefaultConnectionFactory] =
    if (!enabled) {
      None
    } else {
      Some(makeConnectionFactory())
    }

  private def makeConnectionFactory(): DefaultConnectionFactory = {
    val connConfig = ConnectionConfig.builder.url(ldapUrl)

    if (useStartTls) {
      connConfig.useStartTLS(true)
    }

    if (bindingEnabled) {
      connConfig.connectionInitializers(BindConnectionInitializer.builder()
        .dn(bindingDn)
        .credential(bindingPassword)
        .build
      )
    }

    new DefaultConnectionFactory(connConfig.build)
  }

  private def runWithConnectionFactory[T](fn: DefaultConnectionFactory => Option[T]): Option[T] =
    connectionFactory.flatMap(fn)
}
