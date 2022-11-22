package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.types.MysqlPrivileges
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class MySqlOperationsService(override val dbName: String, override val username: String, override val queryTimeout: Int)
  extends DBOperationsService(dbName, username, queryTimeout) {
  private val WRITE_USER_PRIVILEGES: MysqlPrivileges =
    MysqlPrivileges("CREATE, SELECT, INSERT, UPDATE, DELETE, DROP, REFERENCES, CREATE VIEW, ALTER, INDEX")
  private val READ_USER_PRIVILEGES: MysqlPrivileges =
    MysqlPrivileges("SELECT")

  override def createDB(client: SQLConnection, noDrop: Boolean = false): Future[ResultSet] = {
    val dropStatement = if (noDrop) "" else s"DROP DATABASE IF EXISTS $dbName;"
    client.queryFuture(s"$dropStatement CREATE DATABASE $dbName;")
  }

  override def createDBIfNotExist(client: SQLConnection, noDrop: Boolean = false): Future[Boolean] = ???

  override def deleteDB(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(s"DROP DATABASE $dbName")
  }

  override def createUserWithWriteAccess(client: JDBCClient, skipUserCreation: Boolean = false): Future[String] = {
    val password = if (skipUserCreation) "" else generateUserPassword()

    val userCreateQuery = if (skipUserCreation) "" else s"""CREATE USER '$username'@'%' IDENTIFIED BY '$password';"""
    val writeQuery =
      s"""$userCreateQuery
         |GRANT ${WRITE_USER_PRIVILEGES.db} ON $dbName.* TO '$username'@'%';
         |FLUSH PRIVILEGES;
         |""".stripMargin

    client.queryFuture(writeQuery).map(_ => password)
  }

  override def createUserIfNotExist(client: SQLConnection, password: String): Future[ResultSet] = {
    val writeQuery =
      s"""CREATE USER IF NOT EXISTS '$username'@'%' IDENTIFIED BY '$password';
         |""".stripMargin

    client.queryFuture(writeQuery)
  }

  override def changeUserToReadOnly(client: JDBCClient): Future[ResultSet] = {
    val readQuery =
      s"""REVOKE ${WRITE_USER_PRIVILEGES.db} ON $dbName.* FROM '$username'@'%';
         |GRANT ${READ_USER_PRIVILEGES.db} ON $dbName.* TO '$username'@'%';
         |FLUSH PRIVILEGES;
         |""".stripMargin

    client.queryFuture(readQuery)
  }

  override def deleteUser(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(s"DROP USER '$username'@'%';")
  }

  override def getDatabaseInformation(client: JDBCClient): Future[ResultSet] = ???
}
