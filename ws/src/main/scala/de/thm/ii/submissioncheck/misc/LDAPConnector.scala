package de.thm.ii.submissioncheck.misc

import java.util.Properties
import javax.naming.Context
import javax.naming.directory.InitialDirContext
import org.ldaptive._

/**
  * Using ldaptive to simple register to THM LDAP Service
  *
  * @author http://www.ldaptive.org/
  */
object LDAPConnector {
  private val LDAPURL = "ldaps://ldap.fh-giessen.de"

  /**
    * A very simple, still in development, methd to access THMs LDAP Service
    *
    * @author Benjamin Manns
    * @param uid user Id where we want to get more informations /attributes of
    * @return Attribute Set
    */
  def loadLDAPInfosByUID(uid: String): LdapEntry = {
    val cf = new DefaultConnectionFactory(LDAPURL)
    val executor = new SearchExecutor()
    executor.setBaseDn("dc=fh-giessen-friedberg,dc=de")
    val result = executor.search(cf, "(uid=" + uid + ")").getResult()
    val entry: LdapEntry = result.getEntry()
    entry
  }

  /**
    * authenticate a THM User by THMs LDAP Server. First we load the entry of the user (if he exists) then we bind him
    *
    * @param uid      CAS / LDAP username
    * @param password Users CAS / Ldap / User Service Password
    * @return Ldap Entry if logged in
    */
  def loginLDAPUserByUIDAndPassword(uid: String, password: String): Option[LdapEntry] = {
    val entry = loadLDAPInfosByUID(uid)
    if (entry != null) {
      val user = entry.getDn

      var loginSuccess = false
      try {
        val props = new Properties()
        props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory")
        props.put(Context.PROVIDER_URL, LDAPURL)
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
