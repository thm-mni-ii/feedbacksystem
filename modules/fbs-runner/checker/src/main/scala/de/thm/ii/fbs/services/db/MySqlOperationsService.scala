package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.types.MysqlPrivileges
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.ResultSet

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class MySqlOperationsService(override val dbName: String, override val username: String) extends DBOperationsService(dbName, username) {
  private val WRITE_USER_PRIVILEGES: MysqlPrivileges =
    MysqlPrivileges("CREATE, SELECT, INSERT, UPDATE, DELETE, DROP, REFERENCES, CREATE VIEW, ALTER, INDEX")
  private val READ_USER_PRIVILEGES: MysqlPrivileges =
    MysqlPrivileges("SELECT")

  override def createDB(client: JDBCClient): Future[ResultSet] = {
    client.queryFuture(s"DROP DATABASE IF EXISTS $dbName; CREATE DATABASE $dbName;")
  }

  override def deleteDB(client: JDBCClient): Future[ResultSet] = {
    client.queryFuture(s"DROP DATABASE $dbName")
  }

  override def initDB(client: JDBCClient, query: String): Future[ResultSet] = {
    client.queryFuture(query)
  }

  override def createUserWithWriteAccess(client: JDBCClient): Future[String] = {
    val password = generateUserPassword()

    val writeQuery =
      s"""CREATE USER '$username'@'%' IDENTIFIED BY '$password';
         |GRANT ${WRITE_USER_PRIVILEGES.db} ON $dbName.* TO '$username'@'%';
         |FLUSH PRIVILEGES;
         |""".stripMargin

    client.queryFuture(writeQuery).map(_ => password)
  }

  override def changeUserToReadOnly(client: JDBCClient): Future[ResultSet] = {
    val readQuery =
      s"""REVOKE ${WRITE_USER_PRIVILEGES.db} ON $dbName.* FROM '$username'@'%';
         |GRANT ${READ_USER_PRIVILEGES.db} ON $dbName.* TO '$username'@'%';
         |FLUSH PRIVILEGES;
         |""".stripMargin

    client.queryFuture(readQuery)
  }

  override def deleteUser(client: JDBCClient): Future[ResultSet] = {
    client.queryFuture(s"DROP USER '$username'@'%';")
  }
}
