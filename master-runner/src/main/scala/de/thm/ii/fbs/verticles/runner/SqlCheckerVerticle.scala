package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.runner.SQLCheckerService
import de.thm.ii.fbs.types.RunArgs
import de.thm.ii.fbs.verticles.HttpVerticle
import io.vertx.lang.scala.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message

import scala.concurrent.Future

/**
  * Object that stores all static vars for the SqlRunnerVerticle
  */
object SqlCheckerVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.sqlChecker"
}

/**
  * Verticle that starts the SqlRunner
  *
  * @author Max Stephan
  */
class SqlCheckerVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  /**
    * start SqlRunnerVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    vertx.eventBus().consumer(SqlCheckerVerticle.RUN_ADDRESS, startSqlChecker).completionFuture()
  }

  private def startSqlChecker(msg: Message[JsonObject]): Future[Unit] = Future {
    val runArgs: RunArgs = msg.body().mapTo(classOf[RunArgs])
    val response = new JsonObject()
      .put("sid", runArgs.submission.id)
      .put("ccid", runArgs.runner.id)

    logger.info(s"SqlChecker received submission ${runArgs.submission.id}")

    val sqlChecker = new SQLCheckerService(runArgs.submission)
    val (exitCode, stdout, stderr) = sqlChecker.invoke()

    response
      .put("exitCode", exitCode)
      .put("stdout", stdout)
      .put("stderr", stderr)

    if (exitCode == 0) {
      logger.info(s"Submission-${runArgs.submission.id} Finished\nSuccess")
      vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(response.put("success", true)))
    } else {
      logger.info(s"Submission-${runArgs.submission.id} Finished\nFailed")
      vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(response.put("success", false)))
    }
  }
}
