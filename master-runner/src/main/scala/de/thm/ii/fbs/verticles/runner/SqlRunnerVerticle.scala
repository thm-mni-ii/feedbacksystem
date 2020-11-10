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
  private var client: Option[JDBCClient] = None

  /**
    * start SqlRunnerVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    val sqlConfig = new JsonObject()
      .put("user", config.getString("SQL_SERVER_USERNAME", "root"))
      .put("password", config.getString("SQL_SERVER_PASSWORD", ""))
      .put("url", config.getString("SQL_SERVER_URL", "jdbc:mysql://localhost:3306"))
      .put("max_pool_size", config.getInteger("SQL_MAX_POOL_SIZE", 15))
      .put("driver_class", "com.mysql.cj.jdbc.Driver")

    client = Option(JDBCClient.createShared(vertx, sqlConfig))

    vertx.eventBus().consumer(RUN_ADDRESS, startSqlRunner).completionFuture()
  }

  private def startSqlRunner(msg: Message[JsonObject]): Future[Unit] = Future {
    val runArgs: RunArgs = msg.body().mapTo(classOf[RunArgs])

    logger.info(s"SqlRunner received submission ${runArgs.submission.id}")

    try {
      // change file paths
      FileService.addUploadDir(runArgs)

      val sqlRunner = new SQLRunnerService(SQLRunnerService.prepareRunnerStart(runArgs), client.get, config.getInteger("SQL_QUERY_TIMEOUT_S", 10))

      val results = for {
        f1Result <- sqlRunner.executeRunnerQueries()
        f2Result <- sqlRunner.executeSubmissionQuery()
      } yield (f1Result, f2Result)

      results.onComplete({
        case Success(value) =>
          val res = sqlRunner.compareResults(value)
          logger.info(s"Submission-${runArgs.submission.id} Finished\nSuccess: ${res._2} \nMsg: ${res._1}")

          vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, res._2, res._1, "", (res._3, Option(value._2)))))

        case Failure(ex: SQLTimeoutException) =>
          handleError(runArgs, s"Das Query hat zu lange gedauert: ${ex.getMessage}")
        case Failure(ex: SQLException) =>
          // TODO not throw exception from config failures (not include informations)
          handleError(runArgs, s"Es gab eine SQLException: ${ex.getMessage.replaceAll("[0-9]*_[0-9]*_[0-9a-zA-z]*_[a-z]*\\.", "")}")
        case Failure(ex: RunnerException) =>
          handleError(runArgs, ex.getMessage)
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
    vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, success = false, "", msg, (None, None))))
  }
}
