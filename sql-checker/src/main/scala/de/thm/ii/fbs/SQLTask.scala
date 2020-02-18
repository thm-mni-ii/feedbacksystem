package de.thm.ii.fbs

import java.sql._
import java.io._
import java.nio.file.{Files, Paths}
import java.util.regex.Pattern

import com.typesafe.config.ConfigFactory
import akka.actor.ActorSystem

import scala.util.control.Breaks._
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
  private val appConfig = ConfigFactory.parseFile(new File(loadFactoryConfigPath()))
  private val config = ConfigFactory.load(appConfig)

  private implicit val system: ActorSystem = ActorSystem("akka-system", config)

  private val logger = system.log
  private implicit val formats = DefaultFormats
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
  private val timeoutsec = 10

  private def loadFactoryConfigPath() = {
    val dev_config_file_path = System.getenv("CONFDIR") + "/../docker-config/sqlchecker/application_dev.conf"
    val prod_config_file_path = "/usr/local/appconfig/application.config"

    var config_factory_path = ""
    if (Files.exists(Paths.get(prod_config_file_path))) {
      config_factory_path = prod_config_file_path
    } else {
      config_factory_path = dev_config_file_path
    }
    config_factory_path
  }

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
  val dbliteral: String = "db"
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
  logger.warning("sqltask-constructor")
  //problem here
  private val filesection = new java.io.File(filepath + "/sections.json")
  private val filedb = new java.io.File(filepath + "/db.sql")
  if (!filesection.exists || !filedb.exists){
    throw new FileNotFoundException
  }

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
    qstatements(i).setQueryTimeout(timeoutsec)
    /** rs */
    val rs = qstatements(i).executeQuery(querystring)
    /** ord */
    val ord = taskqueries(i)("order")
    queryres(i) = new TaskQuery(desc, rs, ord)
  }
  deleteDatabase("little_test")
  logger.warning("sqltask-constructor ended")

  private def toList(res: scala.Array[scala.Array[String]]) = {
    val liste = res.toList
    if (liste.isEmpty){
      List()
    } else {
      liste.map(l => l.toList)
    }
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

  private def deleteDatabase(name: String): Unit = {
    connection.setAutoCommit(false)
    val stmt = connection.createStatement()
    stmt.execute(dropdb + "IF EXISTS " + taskid.toString + us + name + sc)
  }

  private def executeComplexQueries(query: String): ResultSet = {
    val ustatement = connection.createStatement
    ustatement.setQueryTimeout(timeoutsec)
    var res: ResultSet = null
    val p = Pattern.compile("UPDATE.*", 2)
    query.split(";").foreach( q => {
      if (p.matcher(q.trim).matches()){
        ustatement.executeUpdate(q)
      } else {
          if (q.trim.length > 1) res = ustatement.executeQuery(q)
      }
    })

    res
  }

  /**
    * Compares the resultset from usersubmission to the saved result sets and sets a result
    * @param userq srting of the user query
    * @param userid userid
    * @return tuple with message and boolean
    */
  def runSubmission(userq: String, userid: String): (String, Boolean, String, String) = {
    var msg = "Your Query didn't produce the correct result"; var fit = "No query did match"
    var success = false; var identified = false; var foundindex = -1
    val ustatement = connection.createStatement; ustatement.setQueryTimeout(timeoutsec)
    val dbname = userid + us + dbliteral; var userResultSet: List[List[String]] = List()
    createDatabase(dbname)
    try {
      val userres = executeComplexQueries(userq)
      userres.last();userres.beforeFirst();val userarr = arrayfromRS(userres);val userarr_ordered = orderArray(userarr)
      breakable{
        for (i <- 0 until queryc){
          queryres(i).res.beforeFirst()
          var queryarr = arrayfromRS(queryres(i).res)
          userResultSet = toList(userarr)
          var userarray = userarr
          if (queryarr.toList.isEmpty) { // no result from original query, what should compared?
            if (userarray.toList.isEmpty) {
              identified = true
              foundindex = i
              break()
            }
          } else {
            if ((queryarr.length == userarray.length) && (queryarr(0).length == userarray(0).length)){
              if (queryres(i).order.equalsIgnoreCase("variable")){
                queryarr = orderArray(queryarr);
                userarray = userarr_ordered;
              }
              if (compareArray(queryarr, userarray)){
                identified = true
                foundindex = i
                break()
              }
            }
          }
        }
      }
    } catch {
      case ex: SQLTimeoutException => msg = "Das Query hat zu lange gedauert: " + ex.getMessage
      case ex: SQLException => msg = "Es gab eine SQLException: " + ex.getMessage.replaceAll("[1-9][0-9]*_[a-z0-9]+_db\\.", "")
    }
    s.execute(dropdb + taskid + us + dbname)
    if(identified){
      msg = queryres(foundindex).desc
      fit = taskqueries(foundindex)("query")
      if(msg.equals("OK")) success = true
    }
    val userqueryRes = if (identified) toList(arrayfromRS(queryres(foundindex).res)) else List()
    (msg, success, JsonHelper.listToJsonStr(userqueryRes), JsonHelper.listToJsonStr(userResultSet))
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

  private def arrayfromRS(rs: ResultSet): scala.Array[scala.Array[String]] = {
    val rsmd = rs.getMetaData()
    val cols = rsmd.getColumnCount()
    rs.last()
    val rows = rs.getRow
    rs.beforeFirst()
    var table = scala.Array.ofDim[String](rows, cols)
    /*
    val table: Array[Array[String]] = (new Array[Array[String]](rows): Array[Array[String]])
    for (i <- 0 until rows) table(i) = new Array[String](cols)
    */
    for (j <- 0 until (rows)) {
      rs.next()
      for(k <- 0 until (cols)){
        val str = rs.getString(k + 1)
        table(j)(k) = str
      }
    }
    rs.beforeFirst()
    table
  }

  private def compareArray(a1: scala.Array[scala.Array[String]], a2: scala.Array[scala.Array[String]]): Boolean = {
    var res = true
    breakable{
      for (i <- 0 until a1.length){
        for (j <- 0 until a1(0).length){
          if ( !((a1(i)(j)).equals(a2(i)(j)))){
            res = false
            break()
          }
        }
      }
    }
    res
  }

  private def sortbyField(arr1: scala.Array[String], arr2: scala.Array[String]) = {
    arr1.mkString > arr2.mkString
  }
  private def orderArray(array: scala.Array[scala.Array[String]]): scala.Array[scala.Array[String]] = {
    array.sortWith(sortbyField)
  }
}
