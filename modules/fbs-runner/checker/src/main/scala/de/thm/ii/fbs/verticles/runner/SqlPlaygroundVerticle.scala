package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.db.PsqlOperationsService
import de.thm.ii.fbs.services.runner.{SQLPlaygroundService}
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.DBTypes.PSQL_CONFIG_KEY
import de.thm.ii.fbs.util.PlaygroundDBConnections
import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.SqlPlaygroundVerticle.RUN_ADDRESS
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.ext.jdbc.JDBCClient

import java.sql.{SQLException, SQLTimeoutException}
import scala.concurrent.Future
import scala.util.{Failure, Success}

/**
 * Object that stores all static vars for the SqlPlaygroundVerticle
 */
object SqlPlaygroundVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.sqlPlayground"
}

/**
 * Verticle that starts the SqlPlayground
 *
 * @author Max Stephan
 */
class SqlPlaygroundVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)
  private var sqlPools = Map[String, SqlPoolWithConfig]()

  /**
   * start SqlRunnerVerticle
   *
   * @return vertx Future
   */
  override def startFuture(): Future[_] = {
    val psqlDataSource = s"${PSQL_CONFIG_KEY}_playground"
    val psqlConfig = new JsonObject()
      .put("user", config.getString("SQL_PLAYGROUND_PSQL_SERVER_USERNAME", "root"))
      .put("password", config.getString("SQL_PLAYGROUND_PSQL_SERVER_PASSWORD", ""))
      .put("url", config.getString("SQL_PLAYGROUND_PSQL_SERVER_URL", "jdbc:postgresql://localhost:5432"))
      .put("max_pool_size", config.getInteger("SQL_PLAYGROUND_INSTANCES", 15))
      .put("driver_class", "org.postgresql.Driver")
      .put("max_idle_time", config.getInteger("SQL_MAX_IDLE_TIME", 10))
      .put("dataSourceName", psqlDataSource)
    val psqlPool = JDBCClient.createShared(vertx, psqlConfig, psqlDataSource)
    sqlPools += (PSQL_CONFIG_KEY -> SqlPoolWithConfig(psqlPool, psqlConfig))

    vertx.eventBus().consumer(RUN_ADDRESS, startSqlPlayground).completionFuture()
  }

  private def copyDatabaseAndCreateUser(runArgs: SqlPlaygroundRunArgs): Future[String] = {
    // Extract sqlRunArgs from the message


    // Get the PlaygroundDBConnections
    val con = getConnection(runArgs).getOrElse(throw new Exception("Failed to get database connection"))

    // Get the query timeout from config
    val queryTimeout = config.getInteger("SQL_QUERY_TIMEOUT_S", 10)

    // Create an instance of SQLPlaygroundService
    val sqlPlaygroundService = new SQLPlaygroundService(runArgs, con, queryTimeout)

    // Extract source and target host
    val sourceHost = config.getString("PSQL_SERVER_URL", "jdbc:postgresql://localhost:5432").split("//")(1).split("/")(0)
    val targetHost = config.getString("PSQL_SHARING_SERVER_URL", "jdbc:postgresql://psql-sharing:5432").split("//")(1).split("/")(0)

    // Get the JDBC client for the target database
    val targetClient = sqlPools.getOrElse(PSQL_CONFIG_KEY, throw new Exception("PSQL config not found")).pool

    // Call the method to copy database and create user
    sqlPlaygroundService.copyDBAndCreateUser(sourceHost, targetHost, targetClient)
  }

  private def startSqlPlayground(msg: Message[JsonObject]): Future[Unit] = Future {
    val runArgs = msg.body().mapTo(classOf[SqlPlaygroundRunArgs])

    try {
      logger.info(s"SqlPlayground received execution ${runArgs.executionId}")

      val con = getConnection(runArgs)

      if (con.isDefined) {
        executeQueries(runArgs, con.get)
        // Call the method to copy database and create user
        copyDatabaseAndCreateUser(runArgs).onComplete {
          case Success(uri) => logger.info(s"Database copied, new URI: $uri")
          case Failure(ex) => logger.error("Error in copying database and creating user", ex)
        }
      }
    } catch {
      case e: Throwable => handleError(runArgs, e)
    }
  }

  private def getConnection(runArgs: SqlPlaygroundRunArgs): Option[PlaygroundDBConnections] = {
    try {
      val poolWithConfig = sqlPools.getOrElse(runArgs.database.dbType.toLowerCase, sqlPools.default(PSQL_CONFIG_KEY))
      Option(new PlaygroundDBConnections(vertx, poolWithConfig))
    } catch {
      case e: Throwable =>
        handleError(runArgs, e)
        None
    }
  }

  private def executeQueries(runArgs: SqlPlaygroundRunArgs, con: PlaygroundDBConnections): Unit = {
    val sqlPlayground = new SQLPlaygroundService(runArgs, con, config.getInteger("SQL_QUERY_TIMEOUT_S", 10))

    sqlPlayground.executeStatement().onComplete({
      case Success(value) =>
        try {
          logger.info(s"Execution-${runArgs.executionId} Finished")

          vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLPlaygroundService.transformResult(runArgs, Option(value._1), Option(value._2))))
        } catch {
          case e: Throwable => handleError(runArgs, e)
        }

      case Failure(ex: SQLTimeoutException) =>
        handleError(runArgs, ex, s"Das Query hat zu lange gedauert: ${ex.getMessage}")
      case Failure(ex: SQLException) =>
        handleError(runArgs, ex, getSQLErrorMsg(runArgs, ex))
      case Failure(ex) =>
        handleError(runArgs, ex)
    })
  }

  private def handleError(runArgs: SqlPlaygroundRunArgs, e: Throwable, msg: String = "Die Ausführung des Statements ist fehlgeschlagen."): Unit = {
    logger.error(s"Playground Execution '${runArgs.executionId}' failed", e)
    vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(SQLPlaygroundService.transformResult(runArgs, None, None, error = true, Option(msg))))
  }

  private def getSQLErrorMsg(runArgs: SqlPlaygroundRunArgs, ex: SQLException): String = {
    // Remove DB Name from Error message
    var errorMsg = ex.getMessage.replaceAll("playground_db_[0-9]+", runArgs.database.name)
    // Remove Username Name from Error message
    errorMsg = errorMsg.replaceAll("'playground_user_[0-9]+'", s"'${runArgs.user.username}'")

    s"Es gab eine SQLException: $errorMsg"
  }
}
