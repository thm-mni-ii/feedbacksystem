package de.thm.ii.fbs.util

// TODO: Change to enum?
object SqlPlaygroundMode {
  val EXECUTE_CONFIG_KEY = "execute"
  val DELETE_DB_CONFIG_KEY = "deleteDb"

  def shouldDeleteDatabase(key: String): Boolean = key.equals(DELETE_DB_CONFIG_KEY)
}
