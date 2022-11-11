package de.thm.ii.fbs.verticles

import de.thm.ii.fbs.services.runner.SQLPlaygroundService
import de.thm.ii.fbs.verticles.HttpVerticle.SEND_COMPLETION
import de.thm.ii.fbs.verticles.runner.{BashRunnerVerticle, SqlCheckerVerticle, SqlPlaygroundVerticle, SqlRunnerVerticle}
import io.vertx.lang.scala.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.core.http._
import io.vertx.scala.core.net.PfxOptions
import io.vertx.scala.ext.web.handler.BodyHandler
import io.vertx.scala.ext.web.{Router, RoutingContext}

import scala.concurrent.Future

/**
  * Object that stores all static vars for the HttpVerticle
  */
object HttpVerticle {
  /** The Event Bus adress for sending and Completion Request */
  val SEND_COMPLETION = "de.thm.ii.fbs.completion"
}

/**
  * HttpServer that receives all submissions
  *
  * @author Max Stephan
  */
class HttpVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)
  private var client: Option[HttpClient] = None

  /**
    * start HttpVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    registerClient().zip(registerServer())
  }

  private def registerServer(): Future[HttpServer] = {
    val router = Router.router(vertx)
    // add routes
    router
      .post("/runner/start")
      .handler(BodyHandler.create())
      .handler(run)
    // TODO validate request params

    // Activate ssl
    val options = HttpServerOptions()
      .setSsl(config.getBoolean("SERVER_SSL", false))
      .setPfxKeyCertOptions(
        PfxOptions()
          .setPassword(config.getString("PFX_PASSWORD"))
          .setPath(config.getString("PFX_PATH"))
      )

    // Create Server
    vertx
      .createHttpServer(options)
      .requestHandler(router.accept _)
      .listenFuture(config.getInteger("SERVER_PORT", 8081), config.getString("SERVER_HOST", "0.0.0.0"))
  }

  private def registerClient(): Future[Unit] = {
    // Configure Client
    val options = HttpClientOptions()
      .setSsl(config.getBoolean("RESULT_SERVER_SSL", true))
      .setVerifyHost(config.getBoolean("RESULT_SERVER_VERIFY_HOST", true))
      .setTrustAll(config.getBoolean("RESULT_SERVER_TRUST_ALL", false))
      .setDefaultHost(config.getString("RESULT_SERVER_HOST", "localhost"))
      .setDefaultPort(config.getInteger("RESULT_SERVER_PORT", 80))

    client = Option(vertx.createHttpClient(options))
    vertx.eventBus().consumer(SEND_COMPLETION, sendResult).completionFuture()
  }

  private def run(ctx: RoutingContext): Unit = {
    val body = ctx.getBodyAsJson()
    val rType = body.getOrElse(new JsonObject()).getJsonObject("runner").getString("type")

    rType match {
      case "bash" =>
        vertx.eventBus().send(BashRunnerVerticle.RUN_ADDRESS, body)
        ctx.response().setStatusCode(202).end()
      case "sql" =>
        vertx.eventBus().send(SqlRunnerVerticle.RUN_ADDRESS, body)
        ctx.response().setStatusCode(202).end()
      case "sql-checker" =>
        vertx.eventBus().send(SqlCheckerVerticle.RUN_ADDRESS, body)
        ctx.response().setStatusCode(202).end()
      case "sql-playground" =>
        vertx.eventBus().send(SqlPlaygroundVerticle.RUN_ADDRESS, body)
        ctx.response().setStatusCode(202).end()
      case _ => ctx.response().setStatusCode(404).end("Invalid Runner Type")
    }
  }

  private def sendResult(msg: Message[JsonObject]): Unit = {
    val resultJson = msg.body()

    // Configure Client
    val resource = if (SQLPlaygroundService.isPlaygroundResult(resultJson)) {
      "/playground"
    } else {
      s"/${resultJson.getInteger("sid")}/${resultJson.getInteger("ccid")}"
    }
    val request = client.get.post(s"/results/$resource")

    // Add handler
    request.exceptionHandler({ e =>
      logger.warn("Count not send result", e) // TODO handle
    })
    request.handler(resultResponse)

    // Send Request
    request.putHeader("content-type", "application/json")
    request.end(resultJson.encode())
  }

  private def resultResponse(res: HttpClientResponse): Unit = {
    logger.info(s"result response Status: ${res.statusCode()}")
    // TODO what do here
  }
}
