package de.thm.ii.fbs.services.runner

import java.sql.SQLException
import java.util.regex.Pattern
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import de.thm.ii.fbs.services.{ExtendedResultsService, FileService, SQLResultService}
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.{DBConnections, RunnerException}
import de.thm.ii.fbs.util.Secrets.getSHAStringFromNow
import io.vertx.core.json.DecodeException
import io.vertx.lang.scala.ScalaLogger
import io.vertx.lang.scala.json.JsonObject
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection, SQLOptions}

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
      if (!(runArgs.runner.mainFile.toFile.exists() &&
        runArgs.runner.secondaryFile.toFile.exists() &&
        runArgs.submission.solutionFileLocation.toFile.exists())) {
        throw new RunnerException("Config or Submission files are missing")
      }

      val taskQueries = yamlMapper.readValue(runArgs.runner.mainFile.toFile, classOf[TaskQueries])
      val sections = taskQueries.sections
      // Make dbType Optional
      // TODO Solve in TaskQueries Case Class
      val dbType = if (taskQueries.dbType == null) "mysql" else taskQueries.dbType

      val dbConfig = FileService.fileToString(runArgs.runner.secondaryFile.toFile)
      val submissionQuarry = FileService.fileToString(runArgs.submission.solutionFileLocation.toFile)

      if (submissionQuarry.isBlank) {
        throw new RunnerException("The submission must not be blank!")
      }

      new SqlRunArgs(sections, dbType, dbConfig, submissionQuarry, runArgs.runner.id, runArgs.submission.id)
    } catch {
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
  * @param sqlRunArgs  the Runner arguments
  * @param pool        an sql conection pool
  * @param queryTimout timeoutInSeconds the max amount of seconds the query can take to execute
  */
class SQLRunnerService(val sqlRunArgs: SqlRunArgs, val connections: DBConnections, val queryTimout: Int) {
  private val configDbExt = s"${getSHAStringFromNow()}_c"
  private val submissionDbExt = s"${getSHAStringFromNow()}_s"
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  private def isVariable(taskQuery: TaskQuery): Boolean =
    taskQuery.order != null && taskQuery.order.equalsIgnoreCase("variable")

  private def msgIsOk(msg: String): Boolean =
    msg.equalsIgnoreCase("OK")

  private def taskQueryIsOk(taskQuery: TaskQuery): Boolean =
    msgIsOk(taskQuery.description)

  protected def createDatabase(nameExtenion: String, con: SQLConnection, isSolution: Boolean = false): Future[_] = {
    val name = buildName(nameExtenion) // TODO secure? (prepared q)
    var queries = ""

    if (sqlRunArgs.dbType.equalsIgnoreCase("postgresql")) {
      // postgresql needs the dbname in Quotes
      queries = s"""DROP DATABASE IF EXISTS "$name"; CREATE DATABASE "$name";"""
    } else {
      queries = s"DROP DATABASE IF EXISTS $name; CREATE DATABASE $name;"
    }

    con.executeFuture(queries).flatMap(_ => {
      connections.initQuery(name, isSolution)
      if (isSolution) {
        connections.solutionQueryCon.get.queryFuture(sqlRunArgs.dbConfig)
      } else {
        connections.submissionQueryCon.get.queryFuture(sqlRunArgs.dbConfig)
      }
    })
  }

  protected def deleteDatabases(con: SQLConnection, nameExtension: String): Unit = {
    val name = buildName(nameExtension) // TODO secure? (prepared q)
    var query = ""

    if (sqlRunArgs.dbType.equalsIgnoreCase("postgresql")) {
      // postgresql needs the dbname in Quotes
      query = s"""DROP DATABASE "$name""""
    } else {
      query = s"DROP DATABASE $name"
    }

    con.queryFuture(query).onComplete({
      case Success(_) =>
        con.setOptions(SQLOptions().setCatalog(null))
        con.close()
      case Failure(e) =>
        logger.warn(s"Submission-${sqlRunArgs.submissionId}: Count not delete Submission Database", e)
        con.close()
    })
  }

  private def buildName(nameExtention: String): String = s"${sqlRunArgs.submissionId}_${sqlRunArgs.runnerId}_$nameExtention"

  /**
    * Execute the Runner Queries
    *
    * @return a Future that contains the Results
    */
  def executeRunnerQueries(): Future[List[ResultSet]] = {
    connections.operationCon.getConnectionFuture().flatMap(c => {
      c.setQueryTimeout(queryTimout)

      createDatabase(configDbExt, c, isSolution = true).flatMap[List[ResultSet]](_ => {
        val queries = sqlRunArgs.section
          .map(tq => connections.solutionQueryCon.get.queryFuture(tq.query))

        Future.sequence(queries.toList) transform {
          case s@Success(_) =>
            deleteDatabases(c, configDbExt)
            s
          case Failure(cause) =>
            deleteDatabases(c, configDbExt)

            cause match {
              // Do not display Configuration SQL errors to the user
              case e: SQLException => Failure(new RunnerException(f"invalid Runner configuration: ${e.getMessage}"))
              case _ => Failure(throw cause)
            }
        }
      })
    })
  }

  /**
    * Execute the Submission Queries
    *
    * @return a Future that contains the Results
    */
  def executeSubmissionQuery(): Future[ResultSet] = {
    connections.operationCon.getConnectionFuture().flatMap(c => {
      c.setQueryTimeout(queryTimout)

      createDatabase(submissionDbExt, c).flatMap[ResultSet](_ => {
        executeComplexQuery() transform {
          case s@Success(_) =>
            deleteDatabases(c, submissionDbExt)
            s
          case Failure(cause) =>
            deleteDatabases(c, submissionDbExt)
            Failure(throw cause)
        }
      })
    })
  }

  private def executeComplexQuery(): Future[ResultSet] = {
    /* Split submissions bei ; into sub Queries and execute all und just get the result of the last*/
    val queries = sqlRunArgs.submissionQuery.split(";").map(_.trim).filter(_.nonEmpty)
    val p = Pattern.compile("UPDATE.*", 2)

    queries.foldLeft[Future[ResultSet]](Future {
      SQLResultService.emptyResult()
    })((a, b) => a.flatMap[ResultSet]({ _ =>
      if (p.matcher(b).matches()) {
        connections.submissionQueryCon.get.callFuture(b)
      } else {
        connections.submissionQueryCon.get.queryFuture(b)
      }
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
    var success = false; var identified = false; var foundIndex = -1; var variable = false
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
