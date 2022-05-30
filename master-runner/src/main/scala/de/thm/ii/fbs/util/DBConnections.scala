package de.thm.ii.fbs.util

import io.vertx.core.json.JsonObject
import io.vertx.scala.ext.jdbc.JDBCClient
import io.vertx.scala.core.Vertx

case class DBConnections(vertx: Vertx, defaultConfig: JsonObject) {
  var operationCon: JDBCClient = JDBCClient.createShared(vertx, defaultConfig)
  var submissionQueryCon: Option[JDBCClient] = None
  var solutionQueryCon: Option[JDBCClient] = None

  def initQuery(dbName: String, isSolution: Boolean = false): Unit = {
    val config = defaultConfig.copy()
    config.put("url", buildNewUrl(config.getString("url"), dbName))

    if (isSolution) {
     solutionQueryCon = Option(JDBCClient.create(vertx, config))
    } else {
      submissionQueryCon = Option(JDBCClient.create(vertx, config))
    }
  }

  def close(): Unit = {
    closeOptional(submissionQueryCon)
    closeOptional(solutionQueryCon)
  }

  private def buildNewUrl(url: String, dbName: String) = {
    val parts = url.split('?')
    if (parts.length > 1) {
      // Append / if url not ends with /
      val dbUrl = f"${if (parts(0).endsWith("/")) "" else "/"}$dbName"

      f"${parts(0)}$dbUrl?${parts(1)}"
    } else {
      f"$url/$dbName"
    }
  }

  private def closeOptional(con: Option[JDBCClient]): Unit = {
    con match {
      case Some(c) => c.close()
      case _ =>
    }
  }
}
