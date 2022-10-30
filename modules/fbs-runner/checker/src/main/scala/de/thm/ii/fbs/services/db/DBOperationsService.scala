package de.thm.ii.fbs.services.db

import de.thm.ii.fbs.util.Secrets
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.ResultSet

import scala.concurrent.Future

abstract case class DBOperationsService(dbName: String, username: String) {
  def createDB(client: JDBCClient): Future[ResultSet]

  def deleteDB(client: JDBCClient): Future[ResultSet]

  def initDB(client: JDBCClient, query: String): Future[ResultSet]

  def createUserWithWriteAccess(client: JDBCClient): Future[String]

  def changeUserToReadOnly(client: JDBCClient): Future[ResultSet]

  def deleteUser(client: JDBCClient): Future[ResultSet]

  protected def generateUserPassword(): String =
    Secrets.getSHAStringFromRandom()
}
