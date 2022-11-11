package de.thm.ii.fbs.services.runner

import de.thm.ii.fbs.services.ExtendedResultsService
import de.thm.ii.fbs.services.db.{DBOperationsService, PsqlOperationsService}
import de.thm.ii.fbs.types.SqlPlaygroundRunArgs
import de.thm.ii.fbs.util.{DBConnections, DBTypes}
import io.vertx.core.json.JsonObject
import io.vertx.scala.ext.sql.ResultSet

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

object SQLPlaygroundService {
  final val PLAYGROUND_RESULT_TYPE = "playground"

  def isPlaygroundResult(res: JsonObject): Boolean = res.getString("resultType").equals(PLAYGROUND_RESULT_TYPE)

  /**
    * Transforms the Result into an JsonObject.
    *
    * @param result   The Statement Results
    * @param error    is an Error occurred
    * @param errorMsg the Error Message
    */
  def transformResult(sqlRunArgs: SqlPlaygroundRunArgs, result: Option[ResultSet], error: Boolean = false, errorMsg: Option[String] = None): JsonObject = {
    val res = new JsonObject()

    res.put("executionId", sqlRunArgs.executionId)
      .put("result", ExtendedResultsService.buildTableJson(result))
      .put("error", error)
      .put("errorMsg", errorMsg.getOrElse(""))
      .put("resultType", PLAYGROUND_RESULT_TYPE)
  }
}

class SQLPlaygroundService(val sqlRunArgs: SqlPlaygroundRunArgs, val con: DBConnections, val queryTimeout: Int) {
  private def isPsql: Boolean = DBTypes.isPsql(sqlRunArgs.database.dbType)

  private def initDBOperations(): DBOperationsService = {
    // Currently only PostgresSql is Supported
    if (!isPsql) throw new Error("Invalid DBType. Currently only Psql is Supported")

    val dbName = s"playground_db_${sqlRunArgs.database.id.toString}"
    val username = s"playground_user_${sqlRunArgs.user.id.toString}"
    new PsqlOperationsService(dbName, username, queryTimeout)
  }

  def executeStatement(): Future[ResultSet] = {
    val dbOperations = initDBOperations()

    con.initCon(dbOperations).flatMap(_ => {
      dbOperations.queryFutureWithTimeout(con.queryCon.get, sqlRunArgs.statement)
    }) transform {
      case s@Success(_) =>
        con.close(dbOperations, skipDeletion = true)
        s
      case Failure(cause) =>
        con.close(dbOperations, skipDeletion = true)
        Failure(throw cause)
    }
  }
}
