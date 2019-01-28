package de.thm.ii.submissioncheck.misc

import org.ldaptive.{DefaultConnectionFactory, LdapEntry, SearchExecutor}

/**
  * Using ldaptive to simple register to THM LDAP Service
  * @author http://www.ldaptive.org/
  */
object LDAPConnector
{
  /**
    * A very simple, still in development, methd to access THMs LDAP Service
    * @author Benjamin Manns
    * @param uid user Id where we want to get more informations /attributes of
    * @return Attribute Set
    */
  def loadLDAPInfosByUID(uid: String): LdapEntry = {
    val cf = new DefaultConnectionFactory("ldap://ldap.fh-giessen.de")
    val executor = new SearchExecutor()
    executor.setBaseDn("dc=fh-giessen-friedberg,dc=de")
    val result = executor.search(cf, "(uid=" + uid + ")").getResult()
    val entry: LdapEntry = result.getEntry()
    entry
  }
}
