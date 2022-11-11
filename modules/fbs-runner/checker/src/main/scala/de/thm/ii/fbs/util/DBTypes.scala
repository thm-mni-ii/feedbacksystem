package de.thm.ii.fbs.util

/**
  * Object to Store the DBTypes Config Keys
  */
object DBTypes {
  val MYSQL_CONFIG_KEY = "mysql"
  val PSQL_CONFIG_KEY = "postgresql"

  def isPsql(dbType: String): Boolean = dbType.equalsIgnoreCase(DBTypes.PSQL_CONFIG_KEY)
}
