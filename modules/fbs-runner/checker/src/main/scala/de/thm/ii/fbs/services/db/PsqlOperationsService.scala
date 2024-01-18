package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.types.PsqlPrivileges
import io.vertx.lang.scala.json.JsonArray
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class PsqlOperationsService(override val dbName: String, override val username: String, override val queryTimeout: Int)
  extends DBOperationsService(dbName, username, queryTimeout) {
  private val WRITE_USER_PRIVILEGES: PsqlPrivileges =
    PsqlPrivileges("USAGE, CREATE", "INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, SELECT", "USAGE, SELECT, UPDATE")
  private val READ_USER_PRIVILEGES: PsqlPrivileges =
    PsqlPrivileges("USAGE", "SELECT", "SELECT")

  override def createDB(client: SQLConnection, noDrop: Boolean = false): Future[ResultSet] = {
    val dropStatement = if (noDrop) "" else s"""DROP DATABASE IF EXISTS "$dbName" WITH (FORCE);"""
    client.queryFuture(s"""$dropStatement CREATE DATABASE "$dbName";""")
  }

  override def createDBIfNotExist(client: SQLConnection, noDrop: Boolean): Future[Boolean] = {
    val query = "SELECT FROM pg_database WHERE datname=?"
    val arg = new JsonArray()
    arg.add(dbName)

    client.queryWithParamsFuture(query, arg).flatMap(r => {
      if (r.asJava.getNumRows == 0) {
        createDB(client, noDrop = true).map(_ => true)
      } else {
        Future {
          false
        }
      }
    })
  }

  override def deleteDB(client: SQLConnection): Future[ResultSet] = {
    client.queryFuture(s"""DROP DATABASE "$dbName";""")
  }

  override def createUserWithWriteAccess(client: JDBCClient, skipUserCreation: Boolean = false): Future[String] = {
    val password = if (skipUserCreation) "" else generateUserPassword()

    createPostgresqlUser(client, username, password).map(_ => password)
  }

  def createPostgresqlUser(client: JDBCClient, username: String, password: String): Future[ResultSet] = {
    val userCreateQuery = if (username == "" || password == "") {
      ""
    } else {
      s"""DROP USER IF EXISTS "$username"; CREATE USER "$username" WITH ENCRYPTED PASSWORD '$password';"""
    }
    val writeQuery = buildWriteQuery(username, userCreateQuery)

    client.queryFuture(writeQuery)
  }

  def granForUser(client: JDBCClient, username: String): Future[ResultSet] =
    client.queryFuture(buildWriteQuery(username))

  private def buildWriteQuery(username: String, baseQuery: String = "") = {
    val writeQuery =
      s"""
         |$baseQuery
         |REVOKE CREATE ON SCHEMA public FROM PUBLIC;
         |GRANT CONNECT on DATABASE "$dbName" TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.schema}  ON SCHEMA public TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.table} ON ALL TABLES IN SCHEMA public TO "$username";
         |GRANT ${WRITE_USER_PRIVILEGES.sequence} ON ALL SEQUENCES IN SCHEMA public TO "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${WRITE_USER_PRIVILEGES.table} ON TABLES TO "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${WRITE_USER_PRIVILEGES.sequence} ON SEQUENCES TO "$username";
         |""".stripMargin
    writeQuery
  }

  override def createUserIfNotExist(client: SQLConnection, password: String): Future[ResultSet] = {
    val query =
      s"""
         |DO
         |$$create_user$$
         |BEGIN
         |    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$username') THEN
         |      BEGIN
         |        CREATE USER $username WITH ENCRYPTED PASSWORD '$password';
         |      EXCEPTION WHEN duplicate_object THEN
         |        -- User Already Exist -> Do Nothing
         |      END;
         |    END IF;
         |END
         |$$create_user$$;
         |""".stripMargin

    client.queryFuture(query)
  }

  override def changeUserToReadOnly(client: JDBCClient): Future[ResultSet] = {
    val readQuery =
      s"""REVOKE ALL ON DATABASE "$dbName" FROM "$username";
         |REVOKE ALL ON SCHEMA public FROM "$username";
         |REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "$username";
         |REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM "$username";
         |ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM "$username";
         |GRANT CONNECT on DATABASE "$dbName" TO "$username";
         |GRANT ${READ_USER_PRIVILEGES.schema} ON SCHEMA public TO "$username";
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
    client.queryFuture(s"$getTablesDatabaseInformationQuery $getConstrainsDatabaseInformationQuery $getViewsDatabaseInformationQuery " +
      s"$getRoutinesDatabaseInformationQuery $getTriggersDatabaseInformationQuery")
  }

  private def getTablesDatabaseInformationQuery = {
    """
      |SELECT c.table_name as name,
      |json_agg(json_build_object('name', column_name, 'isNullable', is_nullable::boolean, 'udtName', udt_name) ORDER BY ordinal_position) as json
      |FROM information_schema.columns as c
      |join information_schema.tables as t on c.table_name = t.table_name and c.table_schema = t.table_schema
      |WHERE c.table_schema = 'public' and t.table_type != 'VIEW'
      |group by c.table_name, t.table_type;
      |""".stripMargin
  }

  private def getConstrainsDatabaseInformationQuery = {
    """
      |select constrains.table_name as table,
      |json_agg(json_build_object('columnName', constrains.column_name, 'name',
      |constrains.constraint_name, 'type', constrains.constraint_type, 'checkClause', constrains.check_clause)) as json
      |from (select tc.table_name, kcu.column_name, kcu.constraint_name, tc.constraint_type, null as check_clause
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
  }

  private def getViewsDatabaseInformationQuery = {
    """
      |SELECT table_name as table, view_definition as definition
      |FROM information_schema.views
      |WHERE table_schema = 'public';
      |""".stripMargin
  }

  private def getRoutinesDatabaseInformationQuery = {
    """
      |SELECT DISTINCT ON (oid)
      |routine_name as name, routine_type as type,
      |routine_definition as definition,
      |pg_catalog.pg_get_function_identity_arguments(p.oid) AS parameters
      |FROM information_schema.routines i
      |JOIN pg_catalog.pg_proc p ON i.routine_name = p.proname
      |WHERE routine_schema = 'public';
      |""".stripMargin
  }

  private def getTriggersDatabaseInformationQuery = {
    """
      |SELECT trigger_name as name,
      |event_object_table as objectTable,
      |json_agg(event_manipulation) as json,
      |action_statement as statement, action_orientation as orientation, action_timing as timing
      |FROM information_schema.triggers
      |WHERE trigger_schema = 'public' group by trigger_name, action_statement, action_orientation, action_timing, event_object_table;
      |""".stripMargin
  }

  override def queryFutureWithTimeout(client: JDBCClient, sql: String): Future[ResultSet] = {
    client.getConnectionFuture().flatMap(con => {
      con.queryFuture(s"SET statement_timeout = ${queryTimeout*1000};").flatMap(_ => {
        con.queryFuture(sql) transform {
          case Success(result) =>
            con.close()
            Try(result)
          case Failure(exception) =>
            con.close()
            Failure(throw exception)
        }
      })
    })
  }
}
