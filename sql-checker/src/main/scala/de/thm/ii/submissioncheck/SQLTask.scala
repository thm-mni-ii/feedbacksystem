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
    * Class instance definedQueries
    */
  //private val taskqueries: scala.Array[TaskQuery] = queries
  /**
    * Class instance qcount
    */
  //private val qcount: Int = taskqueries.length
  /**
    * Class instance url
    */
  private val URL: String = config.getString("sql.connectionUri")
  private val user: String = config.getString("sql.user")
  private val password: String = config.getString("sql.password")

  /**
    * Class instance queryresults
    */
  private var taskqueries = new ListBuffer[TaskQuery]
  /**
    * Class instance queryresults
    */
  private var queryresults = new ListBuffer[(String, ResultSet)]
  /**
    * Class instance connection
    */
  var connection: Connection = DriverManager.getConnection(URL, user, password)

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
/*
  for (i <- 0 until qcount){
    s.execute(createdb + courseid.toString + us + taskid.toString + us + i.toString)
    s.execute("USE " + courseid.toString + us + taskid.toString + us + i.toString)
    s.execute(dbdef)
    /**
      * local val
      */
    val rs = s.executeQuery(taskqueries(i).query)
    /**
      * local val
      */
    val desc = taskqueries(i).desc
    queryresults(i) = (desc, rs)
    s.execute(dropdb + courseid.toString + us + taskid.toString + us + i.toString)
  }
*/
  private def createDatabase(): Unit = {
    val dbdef = scala.io.Source.fromFile(filepath + "/db.sql").mkString.split(';')
    connection.setAutoCommit(false)
    val stmt = connection.createStatement()
    //stmt.execute(dropdb + taskid.toString + us + sc)
    stmt.execute(createdb + taskid.toString + us + sc)
    stmt.execute("USE " + taskid.toString + us + sc)
    for(i <- 0 until (dbdef.length - 1)){
      stmt.executeLargeUpdate(dbdef(i))
    }
    //dbdef.foreach(stmt.executeLargeUpdate)
    connection.commit()
    connection.setAutoCommit(true)
  }

  private case class Section(description: String, query: String, order: String)
  //case class Sections(sections: List[Section])

  /**
    *
    *@author Vlad Sokyrskyy
    */
  def saveTask(): Unit = {
    //val jsonstring = scala.io.Source.fromFile(filepath + "/sections.json").mkString
    //val sections = parse(jsonstring).extract[Array[Section]]
    val xml = XML.loadFile(filepath + "/sections.xml")
    val desc = xml \\ "DESCRIPTION"
    val qfile = xml \\ "QUERY"
    val qorder = xml \\ "ORDER"
    val len = qfile.length
    for(i <- 0 until len){
      taskqueries += new TaskQuery(desc(i).text, qfile(i).text, qorder(i).text)
    }
    /*
    val taskqueries: scala.Array[TaskQuery] = new scala.Array[TaskQuery](qfile.length)
    for((sec, i) <- sections.zipWithIndex){
      taskqueries(i).description = sec.description
      taskqueries(i).query = sec.query
      taskqueries(i).order = sec.order
    }
    */
    createDatabase()
    for((tq, i) <- taskqueries.zipWithIndex){
      val querystring = scala.io.Source.fromFile(filepath + "/" + tq.query).mkString
      val rs = s.executeQuery(querystring)
      val desc = taskqueries(i).description
      if(tq.order.equals("Variable")){
        //put lines in order
        //nvm not here
      }
      queryresults += ((desc, rs))
    }
    s.execute(dropdb + taskid.toString + us + sc)
  }

/*
  /**
    * Compares the resultset from usersubmission to the saved result sets and sets a result
    * @param sub the user submission
    * @return tuple with message and boolean
    */
  def runUserSubmission(sub: SQLSubmission): (String, Boolean) = {
    s.execute(createdb + taskid.toString + us + sub.username)
    s.execute("USE " + taskid.toString + us + sub.username)
    s.execute(dbdef)
    val user_rs: ResultSet = s.executeQuery(sub.query)

    var identified: Boolean = false
    for (i <- 0 until qcount){
      breakable{
        for (j <- 1 until user_rs.getRow){
          if (user_rs.next() && queryresults(i)._2.next()){
            breakable{
              val res1 = queryresults(i)._2.getObject(j)
              val res2 = user_rs.getObject(j)
              if (!res1.equals(res2)) {
                logger.debug("Query " + i + "not identified")
                break()
              }
              if(user_rs.isLast == queryresults(i)._2.isLast){
                logger.debug("Query " + i + "identified")
                identified = true
                s.execute(dropdb + courseid.toString + us + taskid.toString + us + sub.username)
                (queryresults(i)._1, queryresults(i)._2)
              }
            }
          }
          if(identified){
            break()
          }
        }
      }
    }
    s.execute(dropdb + courseid.toString + us + taskid.toString + us + sub.username)
    ("Your Query didn't produce the correct result", false)
  }
  */
}
