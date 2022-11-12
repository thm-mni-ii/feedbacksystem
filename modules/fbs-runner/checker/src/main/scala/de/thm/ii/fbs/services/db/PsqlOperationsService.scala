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

  override def createDB(client: SQLConnection, noDrop: Boolean = false): Future[ResultSet] = {
    val dropStatement = if (noDrop) "" else s"""DROP DATABASE IF EXISTS "$dbName";"""
    client.queryFuture(s"""$dropStatement CREATE DATABASE "$dbName";""")
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

  override def getDatabaseInformation(client: JDBCClient): Future[ResultSet] = {
    val tables =
      """
        |SELECT c.table_name, json_agg(json_build_object('columnName', column_name, 'isNullable', is_nullable::boolean, 'udtName', udt_name) ORDER BY ordinal_position) as json
        |FROM information_schema.columns as c
        |join information_schema.tables as t on c.table_name = t.table_name and c.table_schema = t.table_schema
        |WHERE c.table_schema = 'public' and t.table_type != 'VIEW'
        |group by c.table_name, t.table_type;
        |""".stripMargin
    val constrains =
      """
        |select constrains.table_name, json_agg(json_build_object('columnName', constrains.column_name, 'constraintName', constrains.constraint_name, 'constraintType', constrains.constraint_type, 'checkClause', constrains.check_clause)) as json from (select tc.table_name, kcu.column_name, kcu.constraint_name, tc.constraint_type, null as check_clause
        |from information_schema.KEY_COLUMN_USAGE as kcu
        |JOIN information_schema.table_constraints as tc ON tc.constraint_name = kcu.constraint_name
        |where tc.table_schema = 'public'
        |UNION
        |SELECT tc.table_name, SUBSTRING(cc.check_clause from '(?:^|(?:\.\s))(\w+)'), tc.constraint_name, tc.constraint_type, cc.check_clause
        |FROM information_schema.table_constraints as tc
        |JOIN information_schema.check_constraints as cc ON cc.constraint_name = tc.constraint_name
        |AND constraint_type = 'CHECK'
        |where tc.table_schema = 'public') as constrains group by constrains.table_name;
        |""".stripMargin
    val views =
      """
        |SELECT table_name, view_definition
        |FROM information_schema.views
        |WHERE table_schema = 'public';
        |""".stripMargin

    val routines =
      """
        |SELECT routine_name, routine_type, routine_definition
        |FROM information_schema.routines
        |WHERE routine_schema = 'public';
        |""".stripMargin

    val triggers =
      """
        |SELECT trigger_name, event_manipulation, event_object_table, action_statement, action_orientation, action_timing
        |FROM information_schema.triggers
        |WHERE trigger_schema = 'public';
        |""".stripMargin

    client.queryFuture(s"$tables $constrains $views $routines $triggers")
  }
}
