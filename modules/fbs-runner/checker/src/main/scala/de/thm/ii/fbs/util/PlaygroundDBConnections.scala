package de.thm.ii.fbs.util

import de.thm.ii.fbs.services.db.DBOperationsService
import de.thm.ii.fbs.types.SqlPoolWithConfig
import io.vertx.scala.core.Vertx
import io.vertx.scala.ext.jdbc.JDBCClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Failure

class PlaygroundDBConnections(override val vertx: Vertx, override val sqlPoolWithConfig: SqlPoolWithConfig)
  extends DBConnections(vertx, sqlPoolWithConfig) {
  def initCon(dbOperations: DBOperationsService): Future[Unit] = {
    super.initCon(dbOperations, "")
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
    // Generate Password from UserID to avoid storing the password
    val password = Secrets.generateHMAC(dbOperations.username)

    dbOperations.createUserIfNotExist(operationCon.get, password).flatMap(_ => {
      dbOperations.createDBIfNotExist(operationCon.get).flatMap(dbWasCreated => {
        giveUserAccessRights(dbOperations, dbWasCreated).map[Option[JDBCClient]](_ => {
          createPool(dbOperations.dbName, Option(username), Option(password))
        })
      })
    })
  }

  private def giveUserAccessRights(dbOperations: DBOperationsService, dbWasCreated: Boolean): Future[_] = {
    if (dbWasCreated) {
      val pool = createPool(dbOperations.dbName)
      dbOperations.createUserWithWriteAccess(pool.get, skipUserCreation = true).andThen({
        case _ => closeOptional(pool)
      })
    } else {
      Future.unit
    }
  }
}
