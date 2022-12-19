package de.thm.ii.fbs.types

import io.vertx.core.json.JsonObject
import io.vertx.scala.ext.jdbc.JDBCClient

case class SqlPoolWithConfig(pool: JDBCClient, config: JsonObject)
