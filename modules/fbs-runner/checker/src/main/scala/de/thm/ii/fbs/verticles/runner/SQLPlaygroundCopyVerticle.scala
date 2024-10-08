package de.thm.ii.fbs.verticles.runner

import de.thm.ii.fbs.services.db.{PsqlNativeOperationsService, PsqlOperationsService}
import de.thm.ii.fbs.services.runner.SQLPlaygroundService.PLAYGROUND_RESULT_TYPE
import de.thm.ii.fbs.types._
import de.thm.ii.fbs.util.DBTypes.PSQL_CONFIG_KEY
import de.thm.ii.fbs.util.{Metrics, PlaygroundDBConnections}
import de.thm.ii.fbs.verticles.HttpVerticle
import de.thm.ii.fbs.verticles.runner.SqlPlaygroundCopyVerticle.RUN_ADDRESS
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.{ScalaLogger, ScalaVerticle}
import io.vertx.scala.core.eventbus.Message
import io.vertx.scala.ext.jdbc.JDBCClient

import java.net.URI
import java.sql.SQLException
import java.util.Date
import scala.concurrent.Future
import scala.util.{Failure, Success}

/**
 * Object that stores all static vars for the SqlPlaygroundVerticle
 */
object SqlPlaygroundCopyVerticle {
  /** Event Bus Address to start an runner */
  val RUN_ADDRESS = "de.thm.ii.fbs.runner.sqlPlayground.copy"
}

/**
 * Verticle that starts the SqlPlayground
 */
class SqlPlaygroundCopyVerticle extends ScalaVerticle {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)
  private var sqlPools = Map[String, SqlPoolWithConfig]()
  private val meter = Metrics.openTelemetry.meterBuilder("de.thm.mni.ii.fbs.verticles.runner.playground.Copy").build()
  private val processingCounter = meter.upDownCounterBuilder("processingCount").setDescription("Processing Requests").build()
  private val processingTimeCounter = meter.histogramBuilder("processingTime").ofLongs().setDescription("Time for processing").setUnit("ms").build()
  private val errorCounter = meter.counterBuilder("errorCount").setDescription("Error Count").build()

  /**
   * start SqlRunnerVerticle
   *
   * @return vertx Future
   */
  override def startFuture(): Future[_] = {
    val psqlDataSource = s"${PSQL_CONFIG_KEY}_playground_Copy"
    val psqlConfig = new JsonObject()
      .put("user", config.getString("SQL_PLAYGROUND_Copy_PSQL_SERVER_USERNAME", "root"))
      .put("password", config.getString("SQL_PLAYGROUND_Copy_PSQL_SERVER_PASSWORD", ""))
      .put("url", config.getString("SQL_PLAYGROUND_Copy_PSQL_SERVER_URL", "jdbc:postgresql://localhost:5432"))
      .put("max_pool_size", config.getInteger("SQL_PLAYGROUND_STARING_INSTANCES", 256))
      .put("driver_class", "org.postgresql.Driver")
      .put("max_idle_time", config.getInteger("SQL_MAX_IDLE_TIME", 10))
      .put("dataSourceName", psqlDataSource)
    val psqlPool = JDBCClient.createShared(vertx, psqlConfig, psqlDataSource)
    sqlPools += (PSQL_CONFIG_KEY -> SqlPoolWithConfig(psqlPool, psqlConfig))

    vertx.eventBus().consumer(RUN_ADDRESS, sqlPlaygroundCopy).completionFuture()
  }

  private def buildSourceUrl(database: String): String = {
    val base = config.getString("SQL_PLAYGROUND_PSQL_SERVER_URL", "jdbc:postgresql://localhost:5432").split(":", 2)(1)
    val username = config.getString("SQL_PLAYGROUND_PSQL_SERVER_USERNAME", "postgresql")
    val password = config.getString("SQL_PLAYGROUND_PSQL_SERVER_PASSWORD", "")
    val url = new URI(base)
    s"postgresql://${username}:${password}@${url.getHost}:${url.getPort}/${database}"
  }

  private def copyDatabase(runArgs: SqlPlaygroundShareArgs): Future[String] = {
    val sourceURI = buildSourceUrl(s"playground_db_${runArgs.database.id}")
    new PsqlNativeOperationsService(sourceURI).dump()
  }

  /*private def deleteDatabase(id: String): Future[Unit] = Future {
    val conn = getConnection(runArgs).get

    val ops = new PsqlOperationsService(id, id, queryTimeout = 0)
    ops.createDB(conn.operationCon.get)
  }*/

  private def sqlPlaygroundCopy(msg: Message[JsonObject]): Future[Unit] = Future {
    val msgBody = msg.body()
    if (msgBody.getBoolean("delete")) {
      Future.unit
      //deleteDatabase(msgBody.getString("id"))
    } else {
      logger.info("sharing")
      val runArgs = msgBody.mapTo(classOf[SqlPlaygroundShareArgs])

      processingCounter.add(1)
      val startTime = new Date().getTime
      val end = (failure: Boolean) => {
        val endTime = new Date().getTime
        processingTimeCounter.record(endTime - startTime)
        processingCounter.add(-1)
        if (failure) errorCounter.add(1)
      }

      try {
        copyDatabase(runArgs).onComplete {
          case Success(_) => {
            logger.info(s"Database copied")
            end(false)
          }
          case Failure(ex) => {
            end(true)
            logger.error("Error in copying database and creating user", ex)
          }
        }
      } catch {
        case e: Throwable =>
          end(true)
          handleError(runArgs, e)
      }
    }
  }

  private def getConnection(runArgs: SqlPlaygroundShareArgs): Option[PlaygroundDBConnections] = {
    try {
      val poolWithConfig = sqlPools.getOrElse(runArgs.database.dbType.toLowerCase, sqlPools.default(PSQL_CONFIG_KEY))
      Option(new PlaygroundDBConnections(vertx, poolWithConfig))
    } catch {
      case e: Throwable =>
        handleError(runArgs, e)
        None
    }
  }

  def buildResult(runArgs: SqlPlaygroundShareArgs): AnyRef = {
    val res = new JsonObject()

    res.put("executionId", runArgs.executionId)
      .put("resultType", PLAYGROUND_RESULT_TYPE)

    res
  }

  private def handleError(runArgs: SqlPlaygroundShareArgs, e: Throwable, mg: String = "Die Ausführung des Statements ist fehlgeschlagen."): Unit = {
    logger.error(s"Playground sharing failed", e)
    vertx.eventBus().send(HttpVerticle.SEND_COMPLETION, Option(buildResult(runArgs)))
  }

  private def getSQLErrorMsg(runArgs: SqlPlaygroundShareArgs, ex: SQLException): String = {
    // Remove DB Name from Error message
    var errorMsg = ex.getMessage.replaceAll("playground_db_[0-9]+", runArgs.database.name)
    // Remove Username Name from Error message
    errorMsg = errorMsg.replaceAll("'playground_user_[0-9]+'", s"'${runArgs.user.username}'")

    s"Es gab eine SQLException: $errorMsg"
  }
}
