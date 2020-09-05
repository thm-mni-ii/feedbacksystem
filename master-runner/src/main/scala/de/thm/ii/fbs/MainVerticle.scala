package de.thm.ii.fbs

import io.vertx.lang.scala.ScalaVerticle
import de.thm.ii.fbs.server.HttpVerticle

import scala.concurrent.Future

/**
  * Verticle, which starts all other Verticles
  *
  * @author Max Stephan
  */
class MainVerticle extends ScalaVerticle {
  /**
    * start MainVerticle
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[HttpVerticle])
  }
}
