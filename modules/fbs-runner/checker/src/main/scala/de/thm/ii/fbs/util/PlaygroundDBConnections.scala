package de.thm.ii.fbs.util

import de.thm.ii.fbs.services.db.DBOperationsService
import de.thm.ii.fbs.types.SqlPoolWithConfig
import io.vertx.lang.scala.ScalaLogger
import io.vertx.scala.core.Vertx
import io.vertx.scala.ext.jdbc.JDBCClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Failure

class PlaygroundDBConnections(override val vertx: Vertx, override val sqlPoolWithConfig: SqlPoolWithConfig)
  extends DBConnections(vertx, sqlPoolWithConfig) {
  def initCon(dbOperations: DBOperationsService, allowUserWrite: Boolean): Future[Unit] = {
    super.initCon(dbOperations, "", allowUserWrite = allowUserWrite)
  }

  def close(dbOperations: DBOperationsService, deleteDatabase: Boolean = false): Unit = {
    closeOptional(queryCon)

    if (deleteDatabase) {
      dbOperations.deleteDB(operationCon.get)
        .onComplete({
          case Failure(e) =>
            closeOptionalCon(operationCon)
            logger.error(s"Could not delete Database'${dbOperations.dbName}'", e)
          case _ => closeOptionalCon(operationCon)
        })
    } else {
      closeOptionalCon(operationCon)
    }
  }

  override protected def initPool
  (username: String, dbOperations: DBOperationsService, dbConfig: String, allowUserWrite: Boolean, skipDBInt: Boolean): Future[Option[JDBCClient]] = {
    val password = if (sqlPoolWithConfig.config.getString("user") == username) {
      sqlPoolWithConfig.config.getString("password")
    } else {
      // Generate Password from UserID to avoid storing the password
      Secrets.generateHMAC(dbOperations.username)
    }

    dbOperations.createUserIfNotExist(operationCon.get, password).flatMap(_ => {
      dbOperations.createDBIfNotExist(operationCon.get).flatMap(_ => {
        giveUserAccessRights(dbOperations, allowUserWrite).map[Option[JDBCClient]](_ => {
          createPool(dbOperations.dbName, Option(username), Option(password))
        })
      })
    })
  }

  private def giveUserAccessRights(dbOperations: DBOperationsService, allowUserWrite: Boolean): Future[Unit] = {
    val pool = createPool(dbOperations.dbName)
    dbOperations.createUserWithWriteAccess(pool.get, skipUserCreation = true)
      .flatMap(_ => {
        if (allowUserWrite) {
          Future.unit
        } else {
          dbOperations.changeUserToReadOnly(pool.get).map(_ => Unit)
        }
      })
      .andThen({
        case _ => closeOptional(pool)
      })
      .map(_ => Unit)
  }
}
