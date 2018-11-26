package de.thm.submissioncheck

import java.sql._
import scala.sys.process._

/**
  * This class represents a task for an SQL assignment
  * multiple queries are defined and assigned a description of their flaws.
  * Lastly the test database is defined on which the queries and
  * the user query are applied
  *
  * @param name name of task
  * @param dbid id for database
  * @param queries predefined queries of task
  * @param dbdef database definition (sql stmts)
  * @author Vlad Soykrskyy
  */
class SQLTask(val name: String, val dbid: Int, val queries: scala.Array[TaskQuery], val dbdef: String){
  /**
    * Class instance taskname
    */
  final var taskid: String = name

  /**
    * Class instance DBID
    */
  final var DBID: Int = dbid
  /**
    * Class instance JDBCDriver
    */
  final var JDBCDriver: String = "com.mysql.jdbc.Driver"
  /**
    * Class instance definedQueries
    */
  final var taskqueries: scala.Array[TaskQuery] = queries
  /**
    * Class instance qcount
    */
  final var qcount: Int = taskqueries.length
  /**
    * Class instance dbqueries
    */
  final var dbqueries: String = dbdef
  /**
    * Class instance url
    */
  final var URL: String = "jdbc:mysql://localhost" + ":" + "3309"

  /**
    * Class instance queryresults
    */
  var queryresults: scala.Array[(String, ResultSet)] = new scala.Array[(String, ResultSet)](qcount)

  /**
    * Class instance connection
    */
  var connection: Connection = _

  try{
    connection = DriverManager.getConnection(URL, "root", "secretpw")
  } catch {
    case ex: SQLException => {
      print("Connection failed\n")
    }
  }

  if(connection != null){
    print("Connection successful!")
  }
  else {
    print("Failed to establish connection")
  }

  createDB()



  /**
    * This method runs all the taskqueries through the database
    * and sets the queryresults
    */
  def runTaskQueries(): Unit = {
    for (i <- 0 until qcount){
      var s = connection.createStatement()
      var rs = s.executeQuery(taskqueries(i).query)
      var desc = taskqueries(i).desc

      queryresults(i) = (desc, rs)
    }
  }

  /**
    * the database for the task is being created here
    */
  def createDB(): Unit = {
    var s = connection.createStatement()
    var res = s.execute("create database sqlchecker" + DBID.toString)
  }

  /**
    * deletes the database of the task
    */
  def closeTask(): Unit = {
    var s = connection.createStatement()
    var res = s.execute("drop database sqlchecker" + DBID.toString)
    // unfinished
  }

}
