package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.util.Secrets
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

abstract case class DBOperationsService(dbName: String, username: String, queryTimeout: Int) {
  def createDB(client: SQLConnection, noDrop: Boolean = false): Future[ResultSet]

  def deleteDB(client: SQLConnection): Future[ResultSet]

  def initDB(client: JDBCClient, query: String): Future[ResultSet] = {
    queryFutureWithTimeout(client, query)
  }

  def createUserWithWriteAccess(client: JDBCClient): Future[String]

  def changeUserToReadOnly(client: JDBCClient): Future[ResultSet]

  def deleteUser(client: SQLConnection): Future[ResultSet]

  def queryFutureWithTimeout(client: JDBCClient, sql: String): Future[ResultSet] = {
    client.getConnectionFuture().flatMap(con => {
      con.setQueryTimeout(queryTimeout)

      con.queryFuture(sql) transform {
        case Success(result) =>
          con.close()
          Try(result)
        case Failure(exception) =>
          con.close()
          Failure(throw exception)
      }
    })
  }

  def getDatabaseInformation(client: JDBCClient): Future[ResultSet]

  protected def generateUserPassword(): String =
    Secrets.getSHAStringFromRandom()
}
