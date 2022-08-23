package de.thm.ii.fbs.util

import java.time.Duration
import java.util.Properties

import javax.naming.Context
import javax.naming.directory.InitialDirContext
import org.ldaptive._

import scala.jdk.CollectionConverters._

/**
  * Using ldaptive to simple register to THM LDAP Service
  *
  * @author http://www.ldaptive.org/
  */
object LDAPConnector {
  /**
    * A very simple, still in development, method to access THMs LDAP Service
    *
    * @author Benjamin Manns
    * @param uid          user Id where we want to get more information /attributes of
    * @param LDAP_URL     ldap URL is the ldap server we we want to connect us and this has to be loaded from config file
    * @param LDAP_BASE_DN ldap base distinguish name, has to be loaded from config file
    * @return Attribute Set
    */
  def loadLDAPInfosByUID(uid: String)(implicit LDAP_URL: String, LDAP_BASE_DN: String): Option[LdapEntry] = {
    val cf = new DefaultConnectionFactory(LDAP_URL)
    val executor = new SearchExecutor()
    executor.setBaseDn(LDAP_BASE_DN)
    val TIME_OUT = 5
    executor.setTimeLimit(Duration.ofSeconds(TIME_OUT))
    executor.setDerefAliases(DerefAliases.ALWAYS)

    val entries = executor.search(cf, "(uid=" + uid + ")").getResult.getEntries.asScala

    if (entries.size > 1) {
      throw new IllegalArgumentException(s"The user could not be identified by the UID ('$uid') " +
        s"because several entries were found with this UDI. Found '${entries.size}' expected 1.")
    }

    if (entries.nonEmpty) Option(entries.head) else None
  }

  /**
    * authenticate a THM User by THMs LDAP Server. First we load the entry of the user (if he exists) then we bind him
    *
    * @param uid CAS / LDAP username
    * @param password Users CAS / Ldap / User Service Password
    * @param LDAP_URL ldap URL is the ldap server we we want to connect us and this has to be loaded from config file
    * @param LDAP_BASE_DN ldap base distinguish name, has to be loaded from config file
    * @return Ldap Entry if logged in
    */
  def loginLDAPUserByUIDAndPassword(uid: String, password: String)(implicit LDAP_URL: String, LDAP_BASE_DN: String): Option[LdapEntry] = {
    loadLDAPInfosByUID(uid)(LDAP_URL, LDAP_BASE_DN).flatMap(entry => {
      val user = entry.getDn
      try {
        val props = new Properties()
        props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory")
        props.put(Context.PROVIDER_URL, LDAP_URL)
        props.put(Context.SECURITY_PRINCIPAL, user)
        props.put(Context.SECURITY_CREDENTIALS, password)

        // Performs binding and fails on wrong credentials
        new InitialDirContext(props)
        Some(entry)
      } catch {
        case _: Exception => None
      }
    })
  }
}
