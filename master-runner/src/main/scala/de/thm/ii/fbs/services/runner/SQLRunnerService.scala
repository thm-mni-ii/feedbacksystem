package de.thm.ii.fbs.services.runner

import java.util.regex.Pattern

import de.thm.ii.fbs.services.FileService
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.RunnerException
import io.vertx.core.json.{DecodeException, Json}
import io.vertx.lang.scala.ScalaLogger
import io.vertx.lang.scala.json.{JsonArray, JsonObject}
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.ext.sql.{ResultSet, SQLConnection}

import scala.collection.mutable
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
    * @return The Runner Results in a Map
    */
  def transformResult(runArgs: RunArgs, success: Boolean, stdout: String, stderr: String): JsonObject = {
    val res = new JsonObject()
    res.put("ccid", runArgs.runner.id)
      .put("sid", runArgs.submission.id)
      .put("exitCode", if (success) 0 else 1)
      .put("stdout", stdout)
      .put("stderr", stderr)
  }
}

/**
  * Provides all functions to start a SQL Runner
  *
  * @param sqlRunArgs the Runner arguments
  * @param pool       an sql conection pool
  */
class SQLRunnerService(val sqlRunArgs: SqlRunArgs, val pool: JDBCClient) {
  private val configDbExt = "c"
  private val submissionDbExt = "s"
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  private def sortJsonArray(x: JsonArray, y: JsonArray) = {
    x.encode().compareTo(y.encode())
  }

  private def createDatabase(nameExtenion: String, con: SQLConnection): Future[_] = {
    val name = buildName(nameExtenion) // TODO secure? (prepared q)
    val queries = mutable.Buffer(s"DROP database IF EXISTS $name", s"create database $name", s"use $name")
    queries ++= sqlRunArgs.dbConfig.split(";").map(_.trim).filter(_.nonEmpty)

    con.batchFuture(queries)
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
      createDatabase(configDbExt, c).flatMap[List[ResultSet]](_ => {
        val queries = sqlRunArgs.section
          .map(tq => c.queryFuture(tq.query))

        Future.sequence(queries.toList)
      }).map(res => {
        deleteDatabases(c, configDbExt)
        c.close()
        res
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
      createDatabase(submissionDbExt, c).flatMap[ResultSet](_ => {
        executeComplexQuery(c)
      }).map(res => {
        deleteDatabases(c, submissionDbExt)
        res
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
    * @return (Status message, was Successfully)
    */
  def compareResults(res: (List[ResultSet], ResultSet)): (String, Boolean) = {
    var msg = "Your Query didn't produce the correct result"
    var success = false
    var identified = false
    var foundIndex = -1
    val userRes = res._2.getResults
    val userResSorted = userRes.sorted(sortJsonArray)

    breakable {
      for (i <- res._1.indices) {
        val expectedRes = res._1(i).getResults

        if (expectedRes.isEmpty && userRes.isEmpty) { // no result from original query, what should compared?
          identified = true
          foundIndex = i
          break()
        } else {
          if (expectedRes.length == userRes.length) {
            // If the config says that the order of the elements is not imported sort elements and compare
            if (if (sqlRunArgs.section(i).order != null && sqlRunArgs.section(i).order.equalsIgnoreCase("variable"))
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
    }

    (msg, success)
  }
}
