package de.thm.ii.fbs.services.runner

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import de.thm.ii.fbs.services.db.{DBOperationsService, MySqlOperationsService, PsqlOperationsService}
import de.thm.ii.fbs.services.{ExtendedResultsService, FileService, SQLResultService}
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.Secrets.getSHAStringFromNow
import de.thm.ii.fbs.util.{DBConnections, DBTypes, RunnerException}
import io.vertx.core.json.DecodeException
import io.vertx.lang.scala.json.JsonObject
import io.vertx.scala.ext.sql.ResultSet

import java.sql.SQLException
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.control.Breaks.{break, breakable}
import scala.util.{Failure, Success}

/**
  * Provides Helper functions for the SQLRunnerService
  */
object SQLRunnerService {
  private val yamlMapper = new ObjectMapper(new YAMLFactory)

  /**
    * Converts a Runner Configuration into an SQL Runner Configuration.
    *
    * @param runArgs The Runner Configuration
    * @return The SQLRunner args
    * @throws RunnerException if Something goes wrong
    */
  def prepareRunnerStart(runArgs: RunArgs): SqlRunArgs = {
    try {
      // Check if all files exist
      if (!(runArgs.runner.paths.mainFile.toFile.exists() &&
        runArgs.runner.paths.secondaryFile.exists(p => p.toFile.exists()) &&
        runArgs.submission.solutionFileLocation.toFile.exists())) {
        throw new RunnerException("Config or Submission files are missing")
      }

      val taskQueries = yamlMapper.readValue(runArgs.runner.paths.mainFile.toFile, classOf[TaskQueries])

      val sections = if (taskQueries.sections == null) List(new TaskQuery("OK", "Select 1;", "variable")).toArray else taskQueries.sections
      // Make dbType Optional
      // TODO Solve in TaskQueries Case Class
      val dbType = if (taskQueries.dbType == null) DBTypes.MYSQL_CONFIG_KEY else taskQueries.dbType
      val queryType = if (taskQueries.queryType == null) "dql" else taskQueries.queryType
      val dbConfig = FileService.fileToString(runArgs.runner.paths.secondaryFile.get.toFile)
      val submissionQuarry = FileService.fileToString(runArgs.submission.solutionFileLocation.toFile)

      if (submissionQuarry.isBlank) {
        throw new RunnerException("The submission must not be blank!")
      }

      if (queryType != "dql" && queryType != "ddl") {
        throw new RunnerException("The queryType must be ddl or dql!")
      }

      if (queryType.equals("ddl") && dbType.equals("mysql")) {
        throw new RunnerException("DDL just works with PostgreSQL!")
      }

      new SqlRunArgs(sections, dbType, dbConfig, submissionQuarry, runArgs.runner.id, runArgs.submission.id, queryType)
    }
    catch {
      // TODO enhance messages
      case e: RunnerException => throw e
      case e: DecodeException => throw new RunnerException(s"Runner configuration is invalid: ${e.getMessage}")
      case e: IllegalArgumentException => throw new RunnerException(s"Runner configuration is invalid: ${e.getMessage}")
    }
  }

  /**
    * Transforms the Result into an JsonObject.
    *
    * @param runArgs the Runner Arguments
    * @param success if the sql query matched
    * @param stdout  Runner standard Output
    * @param stderr  Runner standard error Output
    * @param results The SQL Runner results
    * @return The Runner Results in a Map
    */
  def transformResult(runArgs: RunArgs, success: Boolean, stdout: String, stderr: String, results: ExtResSql): JsonObject = {
    val res = new JsonObject()
    val extInfo = ExtendedResultsService.buildCompareTable(results)

    res.put("ccid", runArgs.runner.id)
      .put("sid", runArgs.submission.id)
      .put("exitCode", if (success) 0 else 1)
      .put("stdout", stdout)
      .put("stderr", stderr)

    if (extInfo.isEmpty) res else res.put("extInfo", extInfo.get)
  }
}

/**
  * Provides all functions to start a SQL Runner
  *
  * @param sqlRunArgs    the Runner arguments
  * @param solutionCon   DB connections used to execute all Solution queries
  * @param submissionCon DB connections used to execute all Submission queries
  * @param queryTimout   timeoutInSeconds the max amount of seconds the query can take to execute
  */
class SQLRunnerService(val sqlRunArgs: SqlRunArgs, val solutionCon: DBConnections, val submissionCon: DBConnections, val queryTimout: Int) {
  private val configDbExt = s"${getSHAStringFromNow()}_c"
  private val submissionDbExt = s"${getSHAStringFromNow()}_s"

  private def isVariable(taskQuery: TaskQuery): Boolean =
    taskQuery.order != null && taskQuery.order.equalsIgnoreCase("variable")

  private def msgIsOk(msg: String): Boolean =
    msg.equalsIgnoreCase("OK")

  private def taskQueryIsOk(taskQuery: TaskQuery): Boolean =
    msgIsOk(taskQuery.description)

  private def isPsql: Boolean = DBTypes.isPsql(sqlRunArgs.dbType)

  private def shortDBName(dbName: String) = {
    val lastChar = dbName.last
    // Keep _c or _s to avoid collisions
    s"${dbName.slice(0, 30)}_$lastChar"
  }

  private def initDBOperations(nameExtension: String): DBOperationsService = {
    val dbName = buildName(nameExtension)
    // TODO: May find better way to generate the username
    val username = if (isPsql) dbName else shortDBName(dbName) // Mysql only allow usernames with a length of max 32 chars
    val dbOperation = if (isPsql) {
      new PsqlOperationsService(dbName, username, queryTimout)
    } else {
      new MySqlOperationsService(dbName, username, queryTimout)
    }

    dbOperation
  }

  private def buildName(nameExtension: String): String = s"${sqlRunArgs.submissionId}_${sqlRunArgs.runnerId}_$nameExtension"

  /**
    * Execute the Runner Queries
    *
    * @return a Future that contains the Results
    */
  def executeRunnerQueries(): Future[List[ResultSet]] = {
    val dbOperations = initDBOperations(configDbExt)
    val allowUserWrite = sqlRunArgs.queryType.equals("ddl")

    solutionCon.initCon(dbOperations, sqlRunArgs.dbConfig, allowUserWrite).flatMap(_ => {
      val queries = executeRunnerQueryByType(dbOperations)

      Future.sequence(queries) transform {
        case s@Success(_) =>
          solutionCon.closeAndDelete(dbOperations)
          s
        case Failure(cause) =>
          solutionCon.closeAndDelete(dbOperations)

          cause match {
            // Do not display Configuration SQL errors to the user
            case _: SQLException => Failure(new RunnerException(f"invalid Runner configuration"))
            case _ => Failure(throw cause)
          }
      }
    })
  }

  /**
    * Execute the Submission Queries
    *
    * @return a Future that contains the Results
    */
  def executeSubmissionQuery(): Future[ResultSet] = {
    val dbOperations = initDBOperations(submissionDbExt)
    val skipInitDB = sqlRunArgs.queryType.equals("ddl")
    val allowUserWrite = sqlRunArgs.queryType.equals("ddl")

    submissionCon.initCon(dbOperations, sqlRunArgs.dbConfig, allowUserWrite, skipInitDB).flatMap(_ => {
      executeSubmissionQueryByType(dbOperations) transform {
        case s@Success(_) =>
          submissionCon.closeAndDelete(dbOperations)
          s
        case Failure(cause) =>
          submissionCon.closeAndDelete(dbOperations)
          Failure(throw cause)
      }
    })
  }

  private def executeRunnerQueryByType(dbOperations: DBOperationsService): List[Future[ResultSet]] = {
    if (sqlRunArgs.queryType.equals("dql")) {
      sqlRunArgs.section
        .map(tq => dbOperations.queryFutureWithTimeout(solutionCon.queryCon.get, tq.query)).toList
    } else {
      List(solutionCon.queryCon.get.queryFuture(SqlDdlConfig.TABLE_STRUCTURE_QUERY))
    }
  }

  private def executeSubmissionQueryByType(dbOperations: DBOperationsService): Future[ResultSet] = {
    if (sqlRunArgs.queryType.equals("dql")) {
      executeComplexQuery(dbOperations)
    } else {
      val connection = submissionCon.queryCon.get
      dbOperations.queryFutureWithTimeout(connection, sqlRunArgs.submissionQuery)
        .flatMap(_ => connection.queryFuture(SqlDdlConfig.TABLE_STRUCTURE_QUERY))
    }
  }

  private def executeComplexQuery(dbOperations: DBOperationsService): Future[ResultSet] = {
    /* Split submissions at ; into sub Queries and execute all und just get the result of the last*/
    val queries = sqlRunArgs.submissionQuery.split(";").map(_.trim).filter(_.nonEmpty)

    queries.foldLeft[Future[ResultSet]](Future {
      SQLResultService.emptyResult()
    })((a, b) => a.flatMap[ResultSet]({ _ =>
      dbOperations.queryFutureWithTimeout(submissionCon.queryCon.get, b)
    }))
  }

  /**
    * Compare the Runner and Submission results
    *
    * @param res the Querie Results
    * @return (Status message, was Successfully, the correct results set)
    */
  def compareResults(res: (List[ResultSet], ResultSet)): (String, Boolean, ExtResSql) = {
    var msg = "Your Query didn't produce the correct result"
    var success = false
    var identified = false
    var foundIndex = -1
    var variable = false
    val userRes = res._2
    val userResSorted = SQLResultService.sortResult(SQLResultService.copyResult(res._2))
    val correctResults: ExtResSql = new ExtResSql(None, Option(res._2))
    var expectedRes = SQLResultService.emptyResult()

    breakable {
      for (i <- res._1.indices) {
        variable = isVariable(sqlRunArgs.section(i))
        expectedRes = if (variable) SQLResultService.sortResult(res._1(i)) else res._1(i)

        /* Save correct results to use them in the expected results */
        if (correctResults.expected.isEmpty && taskQueryIsOk(sqlRunArgs.section(i))) {
          SQLResultService.buildExpected(correctResults, res._1(i), variable)
        }

        if (expectedRes.getResults.isEmpty && userRes.getResults.isEmpty) {
          // no result from original query, what should compared?
          identified = true
          foundIndex = i
          break()
        } else {
          if (expectedRes.getResults.length == userRes.getResults.length) {
            // If the config says that the order of the elements is not imported compare sorted elements
            if (expectedRes.getResults == (if (variable) userResSorted else userRes).getResults) {
              identified = true
              foundIndex = i
              break()
            }
          }
        }
      }
    }

    if (identified) {
      msg = sqlRunArgs.section(foundIndex).description
      if (msgIsOk(msg)) success = true

      /* Save correct results (get the correctResults that matched or sorted) to use them in the expected results */
      SQLResultService.buildResult(correctResults, userRes, userResSorted, variable)
      if (success) SQLResultService.buildExpected(correctResults, expectedRes, variable)
    }

    (msg, success, correctResults)
  }
}
