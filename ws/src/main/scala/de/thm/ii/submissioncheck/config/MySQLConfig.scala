package de.thm.ii.submissioncheck.config

import java.sql.{Connection, DriverManager, Statement}

class MySQLConfig {

  // TODO Load DB from Input
  val url = "jdbc:mysql://localhost:3308/db1"

  // Since MySQL 8 we need another driver
  val driver = "com.mysql.cj.jdbc.Driver"

  // TODO Load from config file...
  val username = "root"
  val password = "example"

  var connection: Connection = _

  try {
    Class.forName(driver)
    connection = DriverManager.getConnection(url, username, password)
  } catch {
    case e: Exception => e.printStackTrace
  }

  def getConnector = connection

}