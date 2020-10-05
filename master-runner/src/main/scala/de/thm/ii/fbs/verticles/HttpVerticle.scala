package de.thm.ii.fbs.verticles

import de.thm.ii.fbs.verticles.HttpVerticle.SEND_COMPLETION
import de.thm.ii.fbs.verticles.runner.BashRunnerVerticle
import io.vertx.lang.scala.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.core.http.{HttpClient, HttpClientResponse, HttpServer}
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

    vertx
      .createHttpServer()
      .requestHandler(router.accept _)
      .listenFuture(config.getInteger("port", 8081), config.getString("host", "0.0.0.0"))
  }

  private def registerClient(): Future[Unit] = {
    client = Option(vertx.createHttpClient())
    vertx.eventBus().consumer(SEND_COMPLETION, sendResult).completionFuture()
  }

  private def run(ctx: RoutingContext): Unit = {
    val body = ctx.getBodyAsJson()
    val rType = body.getOrElse(new JsonObject()).getJsonObject("runner").getString("type")

    rType match {
      case "bash" =>
        vertx.eventBus().send(BashRunnerVerticle.RUN_ADDRESS, body)
        ctx.response().setStatusCode(202).end()
      case _ => ctx.response().setStatusCode(404).end("Invalid Runner Type")
    }
  }

  private def sendResult(msg: Message[JsonObject]): Unit = {
    try {
      val resultJson = msg.body()

      // Configure Client
      val clientConfig = config.getJsonObject("result.server")
      val request = client.get.post(clientConfig.getInteger("port", 80),
        clientConfig.getString("host", "localhost"),
        s"/results/${resultJson.getInteger("sid")}/${resultJson.getInteger("ccid")}")

      // Send Request
      request.handler(resultResponse).end(resultJson.encode())
    } catch {
      case e: Exception => logger.error("Count not send result", e) // TODO handle
    }
  }

  private def resultResponse(res: HttpClientResponse): Unit = {
    logger.info(s"result response Status: ${res.statusCode()}")
    // TODO what do here
  }
}
