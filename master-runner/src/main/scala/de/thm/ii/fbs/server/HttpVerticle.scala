package de.thm.ii.fbs.server

import io.vertx.lang.scala.ScalaVerticle
import io.vertx.scala.ext.web.Router

import scala.concurrent.Future

/**
  * Test HttpServer
  *
  * @author Max Stephan
  */
class HttpVerticle extends ScalaVerticle {
  /**
    * start HttpVerticle
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    val router = Router.router(vertx)
    router
      .get("/hello")
      .handler(_.response().end("world"))

    vertx
      .createHttpServer()
      .requestHandler(router.accept _)
      .listenFuture(8081, "0.0.0.0")
  }
}
