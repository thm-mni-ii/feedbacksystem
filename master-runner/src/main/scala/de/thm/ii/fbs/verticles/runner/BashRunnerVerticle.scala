package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.runner.BashRunnerService
import de.thm.ii.fbs.services.{DockerService, FileService}
import de.thm.ii.fbs.types.RunArgs
import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.BashRunnerVerticle.RUN_ADDRESS
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message

import scala.concurrent.Future

/**
  * Object that stores all static vars for the BashRunnerVerticle
  */
object BashRunnerVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs"
}

/**
  * Verticle that starts the BashRunner
  *
  * @author Max Stephan
  */
class BashRunnerVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  /**
    * start BashRunnerVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    vertx.eventBus().consumer(RUN_ADDRESS, startBashRunner).completionFuture()
  }

  private def startBashRunner(msg: Message[JsonObject]): Unit = {
    // TODO may run Process and File Operations async?
    // Parse Json to RunArgs
    val runArgs: RunArgs = msg.body().mapTo(classOf[RunArgs])
    val bashRunner = new BashRunnerService(runArgs.runner, runArgs.submission)

    try {
      logger.info(s"BashRunner received submission ${runArgs.submission.id}")

      // Configure Runner
      FileService.addUploadDir(runArgs)
      bashRunner.checkFiles()
      bashRunner.prepareRunnerStart()
      logger.info(s"${runArgs.runner.mainFile}, ${runArgs.runner.secondaryFile}")
      val dockerCmd = bashRunner.getDockerCmd

      logger.info(s"Submission-${runArgs.submission.id}: start Docker-Container")

      // Start the Runner inside of an Docker-Container
      // TODO may run unblocking?
      val (exitCode, stdout, stderr) = DockerService.runContainer(dockerCmd)

      val result = JsonObject.mapFrom(bashRunner.transformResult(exitCode, stdout, stderr))

      logger.info(s"Submission-${runArgs.submission.id} Finished\nExitCode: $exitCode \nstdout: $stdout \nstderr: $stderr")
      logger.info(s"Submission-${runArgs.submission.id}: Send result")

      vertx.eventBus().sendFuture(HttpVerticle.SEND_COMPLETION, Option(result))
      bashRunner.cleanUp()
    } catch {
      case e: Exception =>
        handleError(e, runArgs.submission.id, bashRunner)
    }
  }

  private def handleError(e: Throwable, submissionId: Int, bashRunner: BashRunnerService): Unit = {
    logger.error(s"Error on Submission-$submissionId: ", e)

    val result = JsonObject.mapFrom(Map("sid" -> submissionId, "exitCode" -> -1, "stderr" -> s"Runner: ${e.getMessage}"))
    vertx.eventBus().sendFuture(HttpVerticle.SEND_COMPLETION, Option(result))
    bashRunner.cleanUp()
  }
}
