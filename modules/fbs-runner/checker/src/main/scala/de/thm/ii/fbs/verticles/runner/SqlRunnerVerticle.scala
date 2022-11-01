package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.FileService
import de.thm.ii.fbs.services.runner.SQLRunnerService
import de.thm.ii.fbs.types.{ExtResSql, RunArgs, SqlPoolWithConfig, SqlRunArgs}
import de.thm.ii.fbs.util.{DBConnections, RunnerException}
import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.SqlRunnerVerticle.{MYSQL_CONFIG_KEY, PSQL_CONFIG_KEY, RUN_ADDRESS}
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.ext.jdbc.JDBCClient

import java.sql.{SQLException, SQLTimeoutException}
import scala.concurrent.Future
import scala.util.{Failure, Success}

/**
  * Object that stores all static vars for the SqlRunnerVerticle
  */
object SqlRunnerVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.sql"
  val MYSQL_CONFIG_KEY = "mysql"
  val PSQL_CONFIG_KEY = "postgresql"
}

/**
  * Verticle that starts the SqlRunner
  *
  * @author Max Stephan
  */
class SqlRunnerVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)
  private var sqlPools = Map[String, SqlPoolWithConfig]()

  /**
    * start SqlRunnerVerticle
    *
    * @return vertx Future
    */
  override def startFuture(): Future[_] = {
    val mysqlConfig = new JsonObject()
      .put("user", config.getString("MYSQL_SERVER_USERNAME", "root"))
      .put("password", config.getString("MYSQL_SERVER_PASSWORD", ""))
      .put("url", config.getString("MYSQL_SERVER_URL", "jdbc:mysql://localhost:3306"))
      .put("max_pool_size", config.getInteger("SQL_RUNNER_INSTANCES", 15))
      .put("driver_class", "com.mysql.cj.jdbc.Driver")
      .put("max_idle_time", config.getInteger("SQL_MAX_IDLE_TIME", 10))
      .put("dataSourceName", MYSQL_CONFIG_KEY)
    val mySqlPool = JDBCClient.createShared(vertx, mysqlConfig, MYSQL_CONFIG_KEY)
    sqlPools += (MYSQL_CONFIG_KEY -> SqlPoolWithConfig(mySqlPool, mysqlConfig))

    val psqlConfig = new JsonObject()
      .put("user", config.getString("PSQL_SERVER_USERNAME", "root"))
      .put("password", config.getString("PSQL_SERVER_PASSWORD", ""))
      .put("url", config.getString("PSQL_SERVER_URL", "jdbc:postgresql://localhost:5432"))
      .put("max_pool_size", config.getInteger("SQL_RUNNER_INSTANCES", 15))
      .put("driver_class", "org.postgresql.Driver")
      .put("max_idle_time", config.getInteger("SQL_MAX_IDLE_TIME", 10))
      .put("dataSourceName", PSQL_CONFIG_KEY)
    val psqlPool = JDBCClient.createShared(vertx, psqlConfig, PSQL_CONFIG_KEY)
    sqlPools += (PSQL_CONFIG_KEY -> SqlPoolWithConfig(psqlPool, psqlConfig))

    vertx.eventBus().consumer(RUN_ADDRESS, startSqlRunner).completionFuture()
  }

  private def startSqlRunner(msg: Message[JsonObject]): Future[Unit] = Future {
    val runArgs = msg.body().mapTo(classOf[RunArgs])

    try {
      val sqlRunArgs: SqlRunArgs = getRunArgs(runArgs)

      logger.info(s"SqlRunner received submission ${sqlRunArgs.submissionId}")

      val connections = getConnections(runArgs, sqlRunArgs)

      if (connections.isDefined) {
        runQueries(runArgs, sqlRunArgs, connections.get._1, connections.get._2)
      }
    } catch {
      case e: RunnerException => handleError(runArgs, e.getMessage, e)
      case e: Exception => handleError(runArgs, s"Der SQL Runner hat einen Fehler geworfen: ${e.getMessage}.", e)
    }
  }

  private def getConnections(runArgs: RunArgs, sqlRunArgs: SqlRunArgs): Option[(DBConnections, DBConnections)] = {
    try {
      val poolWithConfig = sqlPools.getOrElse(sqlRunArgs.dbType.toLowerCase, sqlPools.default(MYSQL_CONFIG_KEY))
      Option((DBConnections(vertx, poolWithConfig), DBConnections(vertx, poolWithConfig)))
    } catch {
      case e: Throwable =>
        logger.error(e.getStackTrace.toString)
        handleError(runArgs, "SQL Connection failed", e)
        None
    }
  }

  private def getRunArgs(runArgs: RunArgs): SqlRunArgs = {
    // change file paths
    FileService.addUploadDir(runArgs)

    SQLRunnerService.prepareRunnerStart(runArgs)
  }

  private def runQueries(runArgs: RunArgs, sqlRunArgs: SqlRunArgs, solutionCon: DBConnections, submissionCon: DBConnections): Unit = {
    val sqlRunner = new SQLRunnerService(sqlRunArgs, solutionCon, submissionCon, config.getInteger("SQL_QUERY_TIMEOUT_S", 10))

    val results = for {
      f1Result <- sqlRunner.executeRunnerQueries()
      f2Result <- sqlRunner.executeSubmissionQuery()
    } yield (f1Result, f2Result)

    results.onComplete({
      case Success(value) =>
        val res = sqlRunner.compareResults(value)
        logger.info(s"Submission-${sqlRunArgs.submissionId} Finished\nSuccess: ${res._2} \nMsg: ${res._1}")

        vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, res._2, res._1, "", res._3)))

      case Failure(ex: SQLTimeoutException) =>
        handleError(runArgs, s"Das Query hat zu lange gedauert: ${ex.getMessage}", ex)
      case Failure(ex: SQLException) =>
        handleError(runArgs, getSQLErrorMsg(ex), ex)
      case Failure(ex: RunnerException) =>
        handleError(runArgs, ex.getMessage, ex)
      case Failure(ex) =>
        handleError(runArgs, s"Der SQL Runner hat einen Fehler geworfen: ${ex.getMessage}.", ex)
    })
  }

  private def handleError(runArgs: RunArgs, msg: String, e: Throwable): Unit = {
    logger.info(s"Submission-${runArgs.submission.id} Finished\nSuccess: false \nMsg: $msg", e)
    vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLRunnerService.transformResult(runArgs, success = false, "", msg, new ExtResSql(None, None))))
  }

  private def getSQLErrorMsg(ex: SQLException): String = {
    // Remove DB Name from Error message
    var errorMsg = ex.getMessage.replaceAll("[0-9]*_[0-9]*_[0-9a-zA-z]*_[a-z]*\\.", "")
    // Remove Username Name from Error message
    errorMsg = errorMsg.replaceAll("'[0-9]*_[0-9]*_[0-9a-zA-z]*_[a-z]*'@'[0-9.]*'", "'submission'")

    s"Es gab eine SQLException: $errorMsg"
  }
}
