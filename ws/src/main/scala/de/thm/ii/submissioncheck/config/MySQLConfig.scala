package de.thm.ii.submissioncheck.config

import java.sql.{Connection, DriverManager, Statement}

/**
  * MySQLConfig connects to MySQL 8 DB
  */
class MySQLConfig {
  // TODO Load DB from Input
  /** MySQL 8 URL */
  val url = "jdbc:mysql://localhost:3308/submissionchecker"

  /** Since MySQL 8 we need another driver */
  val driver = "com.mysql.cj.jdbc.Driver"

  // TODO Load from config file...
  /** DB Username */
  val username = "root"

  //TODO Load Password from config file
  /** DB Password */
  val password = "example"

  /** MySQL connection reference */
  var connection: Connection = _

  try {
    Class.forName(driver)
    connection = DriverManager.getConnection(url, username, password)
  } catch {
    case e: Exception => e.printStackTrace
  }

  /**
    * getter Method for MySQL DB
    * @return MySQL 8 Connector
    */
  def getConnector: Connection = connection
}
