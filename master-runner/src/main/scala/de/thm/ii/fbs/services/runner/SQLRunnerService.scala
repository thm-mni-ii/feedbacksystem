package de.thm.ii.fbs.services.runner

import java.sql.SQLException
import java.util.regex.Pattern

import de.thm.ii.fbs.services.{ExtendedResultsService, FileService}
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.RunnerException
import de.thm.ii.fbs.util.Secrets.getSHAStringFromNow
import io.vertx.core.json.{DecodeException, Json}
import io.vertx.lang.scala.ScalaLogger
import io.vertx.lang.scala.json.{JsonArray, JsonObject}
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.control.Breaks.{break, breakable}
import scala.util.{Failure, Success}

/**
  * Provides Helper functions for the SQLRunnerService
  */
object SQLRunnerService {
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

      val sectionString = FileService.fileToString(runArgs.runner.mainFile.toFile)
      val sectionJson: JsonObject = Json.decodeValue(sectionString).asInstanceOf[JsonObject]
      val section = sectionJson.mapTo(classOf[TaskQueries]).sections

      val dbConfig = FileService.fileToString(runArgs.runner.secondaryFile.toFile)
      val submissionQuarry = FileService.fileToString(runArgs.submission.solutionFileLocation.toFile)

      if (submissionQuarry.isBlank) {
        throw new RunnerException("The submission must not be blank!")
      }

      new SqlRunArgs(section, dbConfig, submissionQuarry, runArgs.runner.id, runArgs.submission.id)
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
class SQLRunnerService(val sqlRunArgs: SqlRunArgs, val pool: JDBCClient, val queryTimout: Int) {
  private val configDbExt = s"${getSHAStringFromNow()}_c"
  private val submissionDbExt = s"${getSHAStringFromNow()}_s"
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  private def sortJsonArray(x: JsonArray, y: JsonArray) = {
    x.encode().compareTo(y.encode())
  }

  private def buildCorrectRes(res: ResultSet, variable: Boolean): Option[ResultSet] =
    Option(if (variable) res.setResults(res.getResults.sorted(sortJsonArray)) else res)

  private def createDatabase(nameExtenion: String, con: SQLConnection): Future[_] = {
    val name = buildName(nameExtenion) // TODO secure? (prepared q)
    val queries = s"DROP database IF EXISTS $name; create database $name; use $name; ${sqlRunArgs.dbConfig}"

    con.executeFuture(queries)
  }

  private def deleteDatabases(con: SQLConnection, nameExtension: String): Unit = {
    val name = buildName(nameExtension) // TODO secure? (prepared q)

    con.queryFuture(s"drop database $name").onComplete({
      case Success(_) =>
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
    pool.getConnectionFuture().flatMap(c => {
      c.setQueryTimeout(queryTimout)

      createDatabase(configDbExt, c).flatMap[List[ResultSet]](_ => {
        val queries = sqlRunArgs.section
          .map(tq => c.queryFuture(tq.query))

        Future.sequence(queries.toList) transform {
          case s@Success(_) =>
            deleteDatabases(c, configDbExt)
            s
          case Failure(cause) =>
            deleteDatabases(c, configDbExt)

            cause match {
              // Do not display Configuration SQL errors to the user
              case _: SQLException => Failure(new RunnerException("invalid Runner configuration"))
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
    pool.getConnectionFuture().flatMap(c => {
      c.setQueryTimeout(queryTimout)

      createDatabase(submissionDbExt, c).flatMap[ResultSet](_ => {
        executeComplexQuery(c) transform {
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

  private def executeComplexQuery(con: SQLConnection): Future[ResultSet] = {
    /* Split submissions bei ; into sub Queries and execute all und just get the result of the last*/
    val queries = sqlRunArgs.submissionQuery.split(";").map(_.trim).filter(_.nonEmpty)
    val p = Pattern.compile("UPDATE.*", 2)

    queries.foldLeft[Future[ResultSet]](Future {
      ResultSet()
    })((a, b) => a.flatMap[ResultSet]({ _ =>
      if (p.matcher(b).matches()) {
        con.callFuture(b)
      } else {
        con.queryFuture(b)
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
    val userRes = res._2.getResults
    val userResSorted = userRes.sorted(sortJsonArray)
    val correctResults: ExtResSql = new ExtResSql(None, Option(res._2))

    breakable {
      for (i <- res._1.indices) {
        val expectedRes = res._1(i).getResults
        variable = sqlRunArgs.section(i).order.equalsIgnoreCase("variable")

        /* Save correct results to use them in the expected results */
        if (correctResults.expected.isEmpty && sqlRunArgs.section(i).description.equalsIgnoreCase("OK")) {
          correctResults.expected = buildCorrectRes(res._1(i), variable)
        }

        if (expectedRes.isEmpty && userRes.isEmpty) { // no result from original query, what should compared?
          identified = true
          foundIndex = i
          break()
        } else {
          if (expectedRes.length == userRes.length) {
            // If the config says that the order of the elements is not imported sort elements and compare
            if (if (sqlRunArgs.section(i).order != null && variable)
              expectedRes.sorted(sortJsonArray) == userResSorted else
              expectedRes == userRes
            ) {
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
      if (msg.equalsIgnoreCase("OK")) success = true

      /* Save correct results (get the correctResults that matched or sorted) to use them in the expected results */
      if (success) {
        correctResults.expected = buildCorrectRes(res._1(foundIndex), variable)
        correctResults.result = buildCorrectRes(res._2, variable)
      }
    }

    (msg, success, correctResults)
  }
}
