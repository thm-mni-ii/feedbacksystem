package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.runner.SQLPlaygroundService
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.verticles.runner.SharePlaygroundVerticle.RUN_ADDRESS
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.core.json.JsonObject

import scala.concurrent.Future

class SharePlaygroundVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(getClass.getName)

  override def startFuture(): Future[_] = {
    vertx.eventBus().consumer(RUN_ADDRESS, handleTest).completionFuture()
  }

  //placeholder function
  private def handleTest(msg: Message[JsonObject]): Future[Unit] = Future {
    val argsJson = msg.body()

    val userJson = argsJson.getJsonObject("user")
    val databaseJson = argsJson.getJsonObject("database")

    val userId = userJson.getInteger("id")
    val username = userJson.getString("username")
    val databaseName = databaseJson.getString("name")
    val databaseid = databaseJson.getInteger("id")

    val user = new User(userId, username)
    val database = Database(databaseid, databaseName)

    val args = SharePlaygroundArgs(user, database)

    val response = SQLPlaygroundService.test()
    msg.reply(response)
  }
}

object SharePlaygroundVerticle {
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.share"
}