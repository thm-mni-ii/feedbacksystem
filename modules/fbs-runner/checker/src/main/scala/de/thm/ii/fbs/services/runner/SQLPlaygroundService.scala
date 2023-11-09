package de.thm.ii.fbs.services.runner

import de.thm.ii.fbs.services.ExtendedResultsService
import de.thm.ii.fbs.services.db.{DBOperationsService, PsqlOperationsService}
import de.thm.ii.fbs.types.{OutputJsonStructure, SqlPlaygroundRunArgs}
import de.thm.ii.fbs.util.{DBTypes, DatabaseInformationService, PlaygroundDBConnections, SqlPlaygroundMode}
import io.vertx.core.json.JsonObject
import io.vertx.scala.ext.sql.ResultSet

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

object SQLPlaygroundService {
  final val PLAYGROUND_RESULT_TYPE = "playground"
  private final val outputJsonStructure = List(
    OutputJsonStructure("tables", Option("columns")),
    OutputJsonStructure("constraints", Option("constraints")),
    OutputJsonStructure("views"),
    OutputJsonStructure("routines"),
    OutputJsonStructure("triggers", Option("manipulation"))
  )

  def isPlaygroundResult(res: JsonObject): Boolean = res.getString("resultType", "").equals(PLAYGROUND_RESULT_TYPE)

  /**
    * Transforms the Result into an JsonObject.
    *
    * @param statementResult   The Statement Results
    * @param informationResult The Database information Result
    * @param error             is an Error occurred
    * @param errorMsg          the Error Message
    */
  def transformResult(sqlRunArgs: SqlPlaygroundRunArgs,
                      statementResult: Option[ResultSet],
                      informationResult: Option[ResultSet],
                      error: Boolean = false,
                      errorMsg: Option[String] = None): JsonObject = {
    val res = new JsonObject()

    res.put("executionId", sqlRunArgs.executionId)
      .put("result", ExtendedResultsService.buildMultiResultTable(statementResult))
      .put("databaseInformation", DatabaseInformationService.buildOutputJson(getInformationResultValue(informationResult), outputJsonStructure))
      .put("error", error)
      .put("errorMsg", errorMsg.getOrElse(""))
      .put("mode", sqlRunArgs.mode)
      .put("resultType", PLAYGROUND_RESULT_TYPE)
  }

  /**
    * Default information Result to empty Json Object
    */
  private def getInformationResultValue(informationResult: Option[ResultSet]): JsonObject = {
    if (informationResult.isDefined) {
      informationResult.get.asJava.toJson
    } else {
      new JsonObject()
    }
  }
}

class SQLPlaygroundService(val sqlRunArgs: SqlPlaygroundRunArgs, val con: PlaygroundDBConnections, val queryTimeout: Int) {
  private def isPsql: Boolean = DBTypes.isPsql(sqlRunArgs.database.dbType)

  private def initDBOperations(): DBOperationsService = {
    // Currently only PostgresSql is Supported
    if (!isPsql) throw new Error("Invalid DBType. Currently only Psql is Supported")
    val dbName = s"playground_db_${sqlRunArgs.database.id.toString}"
    val username = s"playground_user_${sqlRunArgs.user.id.toString}"
    new PsqlOperationsService(dbName, username, queryTimeout)
  }

  def executeStatement(): Future[(ResultSet, ResultSet)] = {
    val dbOperations = initDBOperations()
    val deleteDatabase = SqlPlaygroundMode.shouldDeleteDatabase(sqlRunArgs.mode)

    con.initCon(dbOperations).flatMap(_ => {
      executeAndCollectInformation(dbOperations)
    }) transform {
      case s@Success(_) =>
        con.close(dbOperations, deleteDatabase)
        s
      case Failure(cause) =>
        con.close(dbOperations, deleteDatabase)
        Failure(throw cause)
    }
  }

  private def executeAndCollectInformation(dbOperations: DBOperationsService): Future[(ResultSet, ResultSet)] = {
    dbOperations.queryFutureWithTimeout(con.queryCon.get, sqlRunArgs.statement).flatMap(statementResult =>
      dbOperations.getDatabaseInformation(con.queryCon.get).map(informationResult => (statementResult, informationResult))
    )
  }
}
