package de.thm.ii.fbs

import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.{BashRunnerVerticle, SqlRunnerVerticle}
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.config.{ConfigRetriever, ConfigRetrieverOptions, ConfigStoreOptions}
import io.vertx.scala.core.DeploymentOptions

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

    val options = ConfigRetrieverOptions()
      .addStore(
        ConfigStoreOptions()
          .setType("file")
          .setConfig(new io.vertx.core.json.JsonObject().put("path", "config.json"))
      ).addStore(
      ConfigStoreOptions()
        .setType("env")
    )

    val retriever = ConfigRetriever.create(vertx, options)

    /* Start all Other Vertices */
    retriever.getConfigFuture().onComplete({
      case Success(config) =>
        /*Start Http server*/
        val HttpVerticleOptions = DeploymentOptions().setConfig(config)
        vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[HttpVerticle], HttpVerticleOptions)

        /*Start Bash Runner*/
        val bashRunnerVerticleOptions = DeploymentOptions()
          .setConfig(config)
          .setWorker(true)
          .setInstances(config.getInteger("BASH_RUNNER_INSTANCES", 1))

        vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[BashRunnerVerticle], bashRunnerVerticleOptions)

        /*Start SQL Runner*/
        val sqlRunnerVerticleOptions = DeploymentOptions()
          .setConfig(config)
          .setWorker(true)
          .setInstances(config.getInteger("SQL_RUNNER_INSTANCES", 1))

        vertx.deployVerticleFuture(ScalaVerticle.nameForVerticle[SqlRunnerVerticle], sqlRunnerVerticleOptions)
      case Failure(exception) =>
        logger.warn("Could not load Config", exception) //TODO
        vertx.close()
    })
  }
}
