package de.thm.ii.fbs.util

import java.time.Duration
import java.util.Properties

import javax.naming.Context
import javax.naming.directory.InitialDirContext
import org.ldaptive._
import collection.JavaConverters._

/**
  * Using ldaptive to simple register to THM LDAP Service
  *
  * @author http://www.ldaptive.org/
  */
object LDAPConnector {
  /**
    * A very simple, still in development, methd to access THMs LDAP Service
    *
    * @author Benjamin Manns
    * @param uid user Id where we want to get more informations /attributes of
    * @param LDAP_URL ldap URL is the ldap server we we want to connect us and this has to be loaded from config file
    * @param LDAP_BASE_DN ldap base distinguish name, has to be loaded from config file
    * @return Attribute Set
    */
  def loadLDAPInfosByUID(uid: String)(implicit LDAP_URL: String, LDAP_BASE_DN: String): LdapEntry = {
    val cf = new DefaultConnectionFactory(LDAP_URL)
    val executor = new SearchExecutor()
    executor.setBaseDn(LDAP_BASE_DN)
    val TIME_OUT = 5
    executor.setTimeLimit(Duration.ofSeconds(TIME_OUT))
    val entries = executor.search(cf, "(uid=" + uid + ")").getResult.getEntries

    entries.asScala.find(e => e.getAttribute("cn") != null).get
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
    val entry = loadLDAPInfosByUID(uid)(LDAP_URL, LDAP_BASE_DN)
    if (entry != null) {
      val user = entry.getDn

      var loginSuccess = false
      try {
        val props = new Properties()
        props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory")
        props.put(Context.PROVIDER_URL, LDAP_URL)
        props.put(Context.SECURITY_PRINCIPAL, user)
        props.put(Context.SECURITY_CREDENTIALS, password)

        // Performs binding and fails on wrong credentials
        new InitialDirContext(props)
        loginSuccess = true
      } catch {
        case _: Exception => {
          loginSuccess = false
        }
      }
      if (!loginSuccess) {
        None
      } else {
        Some(entry)
      }
    } else {
      None
    }
  }
}
