package de.thm.ii.submissioncheck

import java.sql._
import java.io._

import com.typesafe.config.ConfigFactory
import akka.actor.ActorSystem
import scala.util.control.Breaks._
import scala.collection.mutable.ListBuffer
import scala.xml.XML

import org.json4s._
import org.json4s.jackson.JsonMethods._

/**
  * This class represents a task for an SQL assignment
  * multiple queries are defined and assigned a description of their flaws.
  * Lastly the test database is defined on which the queries and
  * the user query are applied
  * TODO( all IDs from int to string)
  *
  * @param filepath path to directory
  * @param taskId id of the task
  * @author Vlad Soykrskyy
  */
class SQLTask(val filepath: String, val taskId: String){
  private implicit val system: ActorSystem = ActorSystem("akka-system")
  private val logger = system.log
  private val config = ConfigFactory.load()

  private implicit val formats = DefaultFormats

  private val file = new File("./" + filepath)
  /**
    * Class instance taskname
    */
  private val taskid: String = taskId
  /**
    * Class instance JDBCDriver
    */
  final var JDBCDriver: String = config.getString("sql.driver")
  /**
    * Class instance connection
    */
  private val URL: String = config.getString("sql.connectionUri")
  private val user: String = config.getString("sql.user")
  private val password: String = config.getString("sql.password")

  private var connection: Connection = DriverManager.getConnection(URL, user, password)
  private val s = connection.createStatement()
  /**
    * used in queries
    */
  val sc: String = ";"
  /**
    * underscore used in naming
    */
  val us: String = "_"
  /**
    * used in naming
    */
  val dropdb: String = "DROP DATABASE "
  /**
    * used in naming
    */
  val createdb: String = "CREATE DATABASE "

  private case class TaskQuery(desc: String, res: ResultSet, order: String)

  /****** CONSTRUCTOR ******/

  private val jsonstring = scala.io.Source.fromFile(filepath + "/sections.json").mkString
  private val content = parse(jsonstring).extract[Map[String, Any]]
  private val taskqueries = content("sections").asInstanceOf[List[Map[String, String]]]
  private val queryc = taskqueries.length
  //private val qstatements = new scala.Array[Statement](queryc)
  private val qstatements = scala.Array.fill[Statement](queryc)(connection.createStatement)
  private val queryres = new scala.Array[TaskQuery](queryc)

  createDatabase("little_test")
  for((tq, i) <- taskqueries.zipWithIndex){
    /** querystring */
    val querystring: String = taskqueries(i)("query")
    /** desc */
    val desc = taskqueries(i)("description")
    /** rs */
    val rs = qstatements(i).executeQuery(querystring)
    /** ord */
    val ord = taskqueries(i)("order")
    if(ord.equals("Variable")){
      //put lines in order
      //nvm not here
    }
    queryres(i) = new TaskQuery(desc, rs, ord)
  }

  private def createDatabase(name: String): Unit = {
    val dbdef = scala.io.Source.fromFile(filepath + "/db.sql").mkString.split(';')
    connection.setAutoCommit(false)
    val stmt = connection.createStatement()
    stmt.execute(dropdb + "IF EXISTS " + taskid.toString + us + name + sc)
    stmt.execute(createdb + taskid.toString + us + name + sc)
    stmt.execute("USE " + taskid.toString + us + name + sc)
    for(i <- 0 until (dbdef.length - 1)){
      stmt.executeLargeUpdate(dbdef(i))
    }
    //dbdef.foreach(stmt.executeLargeUpdate)
    connection.commit()
    connection.setAutoCommit(true)
  }

  /*
  /**
    *@author Vlad Sokyrskyy
    */
  def saveTask(): Unit = {
    val jsonstring = scala.io.Source.fromFile(filepath + "/sections.json").mkString
    val content = parse(jsonstring).extract[Map[String, Any]]
    val sections = content("sections").asInstanceOf[List[Map[String, String]]]
    taskqueries = sections

    val taskqueries: scala.Array[TaskQuery] = new scala.Array[TaskQuery](qfile.length)
    for((sec, i) <- sections.zipWithIndex){
      taskqueries(i).description = sec.description
      taskqueries(i).query = sec.query
      taskqueries(i).order = sec.order
    }
    createDatabase()
    val queryres = new scala.Array[(String, ResultSet, String)](taskqueries.length)
    for((tq, i) <- taskqueries.zipWithIndex){
      val querystring: String = taskqueries(i)("query")
      val desc = taskqueries(i)("description")
      val rs = s.executeQuery(querystring)
      val ord = taskqueries(i)("order")
      if(ord.equals("Variable")){
        //put lines in order
        //nvm not here
      }
      queryresults += ((desc, rs))
      queryres(i) = (desc, rs, ord)
    }
    for((tq, i) <- taskqueries.zipWithIndex){
    }
    //s.execute(dropdb + taskid.toString + us + sc)
  }
  */
  /**
    * Compares the resultset from usersubmission to the saved result sets and sets a result
    * @param userq srting of the user query
    * @param userid userid
    * @return tuple with message and boolean
    */
  def runSubmission(userq: String, userid: String): (String, Boolean) = {
    val ustatement = connection.createStatement
    val ustatement_ordered = connection.createStatement
    val dbname = userid + us + "db"
    val username = userid + us + taskid
    createDatabase(dbname)
    //s.execute("CREATE USER '" + username + "'@localhost' IDENTIFIED BY 'password'" + sc)
    //s.execute("GRANT ALL PRIVILEGES ON " + dbname + ".* TO '" + username + "@'localhost'" + sc)
    val userres = ustatement.executeQuery(userq)
    //val userres_ordered = ustatement_ordered.executeQuery(userq + " ORDER BY 1 ASC")
    val rsmd = userres.getMetaData()
    val col = rsmd.getColumnCount()
    userres.last()
    val rows = userres.getRow
    userres.beforeFirst()
    var identified = false
    var foundindex = -1

    for (i <- 0 until queryc){
      queryres(i).res.beforeFirst()
      userres.beforeFirst()
      breakable {for (j <- 1 until (rows + 1)) {
          if (userres.next() && queryres(i).res.next()){
            if (!compareRow(userres, i)) {
                break()
            }
            if (queryres(i).res.isLast && userres.isLast){
              identified = true
              foundindex = i
            }
          }
      }}
    }
    s.execute(dropdb + taskid + us + dbname)
    var msg = "Your Query didn't produce the correct result"
    var success = false
    if(identified){
      msg = queryres(foundindex).desc
      if(msg.equals("OK")){
        success = true
      }
    }
    (msg, success)
  }

  private def compareRow(userres: ResultSet, querynum: Int): Boolean = {
    val rsmd = userres.getMetaData()
    val col = rsmd.getColumnCount()
    for(k <- 1 until (col + 1)){
      val res1 = queryres(querynum).res.getObject(k)
      val res2 = userres.getObject(k)
      if (!res1.equals(res2)) {
        false
      }
    }
    true
  }
}
