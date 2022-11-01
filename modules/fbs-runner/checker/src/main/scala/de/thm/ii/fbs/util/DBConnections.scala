package de.thm.ii.fbs.util

import de.thm.ii.fbs.services.db.DBOperationsService
import de.thm.ii.fbs.types.SqlPoolWithConfig
import io.vertx.lang.scala.ScalaLogger
import io.vertx.scala.core.Vertx
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.SQLConnection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Failure

case class DBConnections(vertx: Vertx, sqlPoolWithConfig: SqlPoolWithConfig) {
  val POOL_SIZE = 1
  var operationCon: Option[SQLConnection] = None
  var queryCon: Option[JDBCClient] = None
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  def initDB(dbOperations: DBOperationsService, dbConfig: String): Future[Unit] = {
    sqlPoolWithConfig.pool.getConnectionFuture().flatMap(con => {
      operationCon = Option(con)
      initPool(dbOperations.username, dbOperations, dbConfig).map(pool => {
        queryCon = pool
      })
    })
  }

  def close(dbOperations: DBOperationsService): Unit = {
    closeOptional(queryCon)
    dbOperations.deleteDB(operationCon.get)
      .flatMap(_ => dbOperations.deleteUser(operationCon.get))
      .onComplete({
        case Failure(e) =>
          closeOptionalCon(operationCon)
          logger.error(s"Could not delete Database and/or User '${dbOperations.dbName}'", e)
        case _ => closeOptionalCon(operationCon)
      })
  }

  private def initPool(username: String, dbOperations: DBOperationsService, dbConfig: String): Future[Option[JDBCClient]] = {
    dbOperations.createDB(operationCon.get).flatMap(_ => {
      val pool = createPool(dbOperations.dbName)

      dbOperations.createUserWithWriteAccess(pool.get).flatMap[Option[JDBCClient]](password => {
        val pool2 = createPool(dbOperations.dbName, Option(username), Option(password))
        dbOperations.initDB(pool2.get, dbConfig).flatMap(_ => {
          dbOperations.changeUserToReadOnly(pool.get).map(_ => {
            closeOptional(pool)
            closeOptional(pool2)
            createPool(dbOperations.dbName, Option(username), Option(password))
          })
        })
      })
    })
  }

  private def createPool(dbName: String, username: Option[String] = None, password: Option[String] = None): Option[JDBCClient] = {
    val config = sqlPoolWithConfig.config.copy()
    config.put("url", buildNewUrl(config.getString("url"), dbName))
    config.put("initial_pool_size", POOL_SIZE)
    config.put("min_pool_size", POOL_SIZE)
    config.put("max_pool_size", POOL_SIZE)
    if (username.isDefined) config.put("user", username.get)
    if (password.isDefined) config.put("password", password.get)

    Option(JDBCClient.create(vertx, config))
  }

  private def buildNewUrl(url: String, dbName: String) = {
    val parts = url.split('?')
    if (parts.length > 1) {
      // Append / if url not ends with /
      val dbUrl = f"${if (parts(0).endsWith("/")) "" else "/"}$dbName"

      f"${parts(0)}$dbUrl?${parts(1)}"
    } else {
      f"$url/$dbName"
    }
  }

  private def closeOptional(con: Option[JDBCClient]): Unit = {
    con match {
      case Some(c) => c.close()
      case _ =>
    }
  }

  private def closeOptionalCon(con: Option[SQLConnection]): Unit = {
    con match {
      case Some(c) => c.close()
      case _ =>
    }
  }
}
