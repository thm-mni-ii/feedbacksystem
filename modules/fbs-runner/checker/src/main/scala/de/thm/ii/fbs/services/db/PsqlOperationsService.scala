package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.types.PsqlPrivileges
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PsqlOperationsService(override val dbName: String, override val username: String, override val queryTimeout: Int)
  extends DBOperationsService(dbName, username, queryTimeout) {
  private val WRITE_USER_PRIVILEGES: PsqlPrivileges =
    PsqlPrivileges("USAGE, CREATE", "INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER", "USAGE, SELECT, UPDATE")
  private val READ_USER_PRIVILEGES: PsqlPrivileges =
    PsqlPrivileges("USAGE", "SELECT", "SELECT")

  override def createDB(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(s"""DROP DATABASE IF EXISTS "$dbName"; CREATE DATABASE "$dbName";""")
  }

  override def deleteDB(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(s"""DROP DATABASE "$dbName";""")
  }

  override def createUserWithWriteAccess(client: JDBCClient): Future[String] = {
    val password = generateUserPassword()

    val writeQuery =
      s"""CREATE USER "$username" WITH ENCRYPTED PASSWORD '$password';
         |REVOKE CREATE ON SCHEMA public FROM PUBLIC;
         |GRANT CONNECT on DATABASE "$dbName" TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.schema}  ON SCHEMA public TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.table} ON ALL TABLES IN SCHEMA public TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.sequence} ON ALL SEQUENCES IN SCHEMA public TO "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${WRITE_USER_PRIVILEGES.table} ON TABLES TO "$username";
         |""".stripMargin

    client.queryFuture(writeQuery).map(_ => password)
  }

  override def changeUserToReadOnly(client: JDBCClient): Future[ResultSet] = {
    val readQuery =
      s"""REVOKE ALL ON DATABASE "$dbName" FROM "$username";
         |REVOKE ALL ON SCHEMA public FROM "$username";
         |REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "$username";
         |REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM "$username";
         |GRANT CONNECT on DATABASE "$dbName" TO "$username";
         |GRANT ${READ_USER_PRIVILEGES.schema}  ON SCHEMA public TO "$username";
         |GRANT ${READ_USER_PRIVILEGES.table} ON ALL TABLES IN SCHEMA public TO "$username";
         |GRANT ${READ_USER_PRIVILEGES.sequence} ON ALL SEQUENCES IN SCHEMA public TO "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${READ_USER_PRIVILEGES.table} ON TABLES TO "$username";
         |""".stripMargin

    client.queryFuture(readQuery)
  }

  override def deleteUser(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(
      s"""DROP USER "$username";""")
  }
}
