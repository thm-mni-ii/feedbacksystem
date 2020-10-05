package de.thm.ii.fbs

import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.BashRunnerVerticle
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.config.{ConfigRetriever, ConfigRetrieverOptions, ConfigStoreOptions}
import io.vertx.scala.core.DeploymentOptions

import scala.collection.mutable
import scala.util.{Failure, Success}

/**
  * Verticle, which starts all other Verticles
  *
  * @author Max Stephan
  */
class MainVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  /**
    * start MainVerticle
    *
    * @return vertx Future
    */
  override def start(): Unit = {
    /* Get Configuration */
    val fileStore = ConfigStoreOptions()
      .setType("file")
      .setConfig(new io.vertx.core.json.JsonObject().put("path", "config.json"))

    val sysPropsStore = ConfigStoreOptions()
      .setType("sys")

    val options = ConfigRetrieverOptions()
      .setStores(mutable.Buffer(fileStore, sysPropsStore))

    val retriever = ConfigRetriever.create(vertx, options)

    /* Start all Other Vertices */
    retriever.getConfigFuture().onComplete({
      case Success(config) =>
        val HttpVerticleOptions = DeploymentOptions().setConfig(config.getJsonObject("HttpVerticle"))
        vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[HttpVerticle], HttpVerticleOptions)

        val bashRunnerJson = config.getJsonObject("BashRunnerVerticle")
        val bashRunnerVerticleOptions = DeploymentOptions()
          .setConfig(bashRunnerJson)
          .setWorker(true)
          .setInstances(bashRunnerJson.getInteger("instances", 1))

        vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[BashRunnerVerticle], bashRunnerVerticleOptions)
      case Failure(exception) =>
        logger.warn("Could not load Config", exception) //TODO
        vertx.close()
    })
  }
}
