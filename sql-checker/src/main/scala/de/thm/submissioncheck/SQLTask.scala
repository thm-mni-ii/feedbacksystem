package de.thm.submissioncheck

import java.sql._

import akka.actor.ActorSystem
import scala.util.control.Breaks._

/**
  * This class represents a task for an SQL assignment
  * multiple queries are defined and assigned a description of their flaws.
  * Lastly the test database is defined on which the queries and
  * the user query are applied
  * TODO( all IDs from int to string)
  *
  * @param name name of task
  * @param courseId id of the course
  * @param taskId id of the task
  * @param queries predefined queries of task
  * @param dbdef database definition (sql stmts)
  * @author Vlad Soykrskyy
  */
class SQLTask(val name: String, val courseId: String, val taskId: String, val queries: scala.Array[TaskQuery], val dbdef: String){
  private implicit val system: ActorSystem = ActorSystem("akka-system")
  private val logger = system.log

  /**
    * Class instance taskname
    */
  private val taskid: String = taskId
  /**
    * Class instance courseid
    */
  private val courseid: String = courseId
  /**
    * Class instance JDBCDriver
    */
  final var JDBCDriver: String = "com.mysql.jdbc.Driver"
  /**
    * Class instance definedQueries
    */
  private val taskqueries: scala.Array[TaskQuery] = queries
  /**
    * Class instance qcount
    */
  private val qcount: Int = taskqueries.length
  /**
    * Class instance dbqueries
    */
  private val dbqueries: String = dbdef
  /**
    * Class instance url
    */
  final var URL: String = "jdbc:mysql://localhost" + ":" + "3309"

  /**
    * Class instance queryresults
    */
  private var queryresults: scala.Array[(String, ResultSet)] = new scala.Array[(String, ResultSet)](qcount)

  /**
    * Class instance connection
    */
  var connection: Connection = _
  try{
    connection = DriverManager.getConnection(URL, "root", "secretpw")
  } catch {
    case ex: SQLException => {
      logger.error("Couldn't connect to Checker MySQL Server!")
    }
  }

  private val s = connection.createStatement()
  /* underscore used in naming */
  val us: String = "_"
  /* used in naming */
  val dropdb: String = "DROP DATABASE "
  /* used in naming */
  val createdb: String = "CREATE DATABASE "

  for (i <- 0 until qcount){
    s.execute(createdb + courseid.toString + us + taskid.toString + us + i.toString)
    s.execute("USE " + courseid.toString + us + taskid.toString + us + i.toString)
    s.execute(dbdef)
    /* Hilfsvariable*/
    val rs = s.executeQuery(taskqueries(i).query)
    /* Hilfsvariable*/
    val desc = taskqueries(i).desc
    queryresults(i) = (desc, rs)
    s.execute(dropdb + courseid.toString + us + taskid.toString + us + i.toString)
  }

  /**
    * Compares the resultset from usersubmission to the saved result sets and sets a result
    * @param sub the user submission
    * @return tuple with message and boolean
    */
  def runUserSubmission(sub: SQLSubmission): (String, Boolean) = {
    s.execute(createdb + courseid.toString + us + taskid.toString + us + sub.username)
    s.execute("USE " + courseid.toString + us + taskid.toString + us + sub.username)
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
}
