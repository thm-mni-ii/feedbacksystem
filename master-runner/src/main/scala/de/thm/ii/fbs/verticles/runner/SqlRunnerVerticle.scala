package de.thm.ii.fbs.verticles.runner

import java.sql.{SQLException, SQLTimeoutException}

import de.thm.ii.fbs.services.FileService
import de.thm.ii.fbs.services.runner.SQLRunnerService
import de.thm.ii.fbs.types.RunArgs
import de.thm.ii.fbs.util.RunnerException
import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.SqlRunnerVerticle.RUN_ADDRESS
import io.vertx.lang.scala.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.ext.jdbc.JDBCClient

import scala.concurrent.Future
import scala.util.{Failure, Success}

/**
  * Object that stores all static vars for the SqlRunnerVerticle
  */
object SqlRunnerVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.sql"
}

/**
  * Verticle that starts the SqlRunner
  *
  * @author Max Stephan
  */
class SqlRunnerVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  /**
    * start SqlRunnerVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    vertx.eventBus().consumer(RUN_ADDRESS, startSqlRunner).completionFuture()
  }

  private def startSqlRunner(msg: Message[JsonObject]): Future[Unit] = Future {
    val runArgs: RunArgs = msg.body().mapTo(classOf[RunArgs])

    logger.info(s"SqlRunner received submission ${runArgs.submission.id}")

    try {
      // change file paths
      FileService.addUploadDir(runArgs)

      val sqlConfig = new JsonObject()
        .put("user", config.getString("SQL_SERVER_USERNAME", "root"))
        .put("password", config.getString("SQL_SERVER_PASSWORD", ""))
        .put("url", config.getString("SQL_SERVER_URL", "jdbc:mysql://localhost:3306"))
        .put("driver_class", "com.mysql.cj.jdbc.Driver")

      val client = JDBCClient.createShared(vertx, sqlConfig)

      val sqlRunner = new SQLRunnerService(SQLRunnerService.prepareRunnerStart(runArgs), client)

      val results = for {
        f1Result <- sqlRunner.executeRunnerQueries()
        f2Result <- sqlRunner.executeSubmissionQuery()
      } yield (f1Result, f2Result)

      results.onComplete({
        case Success(value) =>
          val res = sqlRunner.compareResults(value)
          logger.info(s"Submission-${runArgs.submission.id} Finished\nSuccess: ${res._2} \nMsg: ${res._1}")

          vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, res._2, res._1, "")))

        case Failure(ex: SQLException) =>
          // TODO not throw exception from config failures (not include informations)
          handleError(runArgs, s"Es gab eine SQLException: ${ex.getMessage.replaceAll("[1-9][0-9]*_[a-z0-9]+_db\\.", "")}")
        case Failure(ex: RunnerException) =>
          handleError(runArgs, ex.getMessage)
        case Failure(ex: SQLTimeoutException) =>
          handleError(runArgs, s"Das Query hat zu lange gedauert: ${ex.getMessage}")
        case Failure(ex) =>
          handleError(runArgs, s"Der SQL Runner hat einen Fehler geworfen: ${ex.getMessage}.")
      })
    } catch {
      case e: RunnerException => handleError(runArgs, e.getMessage)
      case e: Exception => handleError(runArgs, s"Der SQL Runner hat einen Fehler geworfen: ${e.getMessage}.")
    }
  }

  private def handleError(runArgs: RunArgs, msg: String): Unit = {
    logger.info(s"Submission-${runArgs.submission.id} Finished\nSuccess: false \nMsg: $msg")
    vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, success = false, "", msg)))
  }
}
