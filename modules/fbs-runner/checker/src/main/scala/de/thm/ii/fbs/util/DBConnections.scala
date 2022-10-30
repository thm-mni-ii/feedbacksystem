package de.thm.ii.fbs.util

import de.thm.ii.fbs.services.db.DBOperationsService
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.ScalaLogger
import io.vertx.scala.core.Vertx
import io.vertx.scala.ext.jdbc.JDBCClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Failure

case class DBConnections(vertx: Vertx, defaultConfig: JsonObject) {
  val POOL_SIZE = 1
  var operationCon: JDBCClient = JDBCClient.createShared(vertx, defaultConfig, defaultConfig.getString("dataSourceName"))
  var submissionQueryCon: Option[JDBCClient] = None
  var solutionQueryCon: Option[JDBCClient] = None
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  def initDB(dbOperations: DBOperationsService, dbConfig: String, isSolution: Boolean = false): Future[Unit] = {
    initPool(dbOperations.username, dbOperations, dbConfig).map(pool => {
      if (isSolution) {
        solutionQueryCon = pool
      } else {
        submissionQueryCon = pool
      }
    })
  }

  def closeOne(dbOperations: DBOperationsService, isSolution: Boolean = false): Unit = {
    val con = if (isSolution) {
      solutionQueryCon
    } else {
      submissionQueryCon
    }

    closeOptional(con)
    dbOperations.deleteDB(operationCon).flatMap(_ => dbOperations.deleteUser(operationCon))
      .onComplete({ case Failure(e) => logger.error(s"Could not delete Database and/or User '${dbOperations.dbName}'", e) case _ => })
  }

  def close(): Unit = {
    closeOptional(submissionQueryCon)
    closeOptional(solutionQueryCon)
  }

  private def initPool(username: String, dbOperations: DBOperationsService, dbConfig: String): Future[Option[JDBCClient]] = {
    dbOperations.createDB(operationCon).flatMap(_ => {
      val pool = createPool(dbOperations.dbName)

      dbOperations.createUserWithWriteAccess(pool.get).flatMap[Option[JDBCClient]](password => {
        val pool2 = createPool(dbOperations.dbName, Option(username), Option(password))
        dbOperations.initDB(pool2.get, dbConfig).flatMap(_ => {
          dbOperations.changeUserToReadOnly(pool.get).map(_ => {
            closeOptional(pool)
            pool2
          })
        })
      })
    })
  }

  private def createPool(dbName: String, username: Option[String] = None, password: Option[String] = None): Option[JDBCClient] = {
    val config = defaultConfig.copy()
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
}
