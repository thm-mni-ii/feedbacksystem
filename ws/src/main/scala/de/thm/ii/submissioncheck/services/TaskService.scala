package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet, Statement}
import java.util

import collection.JavaConverters._
import de.thm.ii.submissioncheck.config.MySQLConfig
import de.thm.ii.submissioncheck.misc.BadRequestException
import de.thm.ii.submissioncheck.model.User

import scala.collection.mutable.ListBuffer

/**
  * Enable communication with Tasks and their Results
  *
  * @author Benjamin Manns
  */
class TaskService {
  /** mysqlConnector establish connection to our mysql 8 DB */
  val mysqlConnector: Connection = new MySQLConfig().getConnector

  /**
    * Class holds all DB labels
    */
  class TaskDBLabels{
    /** DB Label "taskid" */
    var taskid: String = "taskid"

    /** DB Label "name" */
    var name: String = "name"

    /** DB Label "description" */
    var description: String = "description"

    /** DB Label "courseid" */
    var courseid: String = "courseid"
  }

  /** holds all unique labels */
  val taskDBLabels = new TaskDBLabels()

  /**
    * Class holds all DB labels
    */
  class SubmissionDBLabels{
    /** DB Label "taskid" */
    var taskid: String = "taskid"

    /** DB Label "submissionid" */
    var submissionid: String = "submissionid"

    /** DB Label "result" */
    var result: String = "result"

    /** DB Label "userid" */
    var userid: String = "userid"

  }

  /** holds all unique labels */
  val submissionDBLabels = new SubmissionDBLabels()

  /**
    * submit a Task
    * @param taskid unique identification for a task
    * @param user requestig User
    * @return Submission ID
    */
  def submitTask(taskid: Int, user: User): Integer = {
    // TODO Check authorization for this taks!!

    val prparStmt = this.mysqlConnector.prepareStatement("INSERT INTO submission " +
      "(taskid, userid) VALUES (?,?);", Statement.RETURN_GENERATED_KEYS)

    // TODO Check if multiple submissions are allowed

    prparStmt.setInt(1, taskid)
    prparStmt.setInt(2, user.userid)
    prparStmt.execute()

    var insertedID = -1
    val rs = prparStmt.getGeneratedKeys
    if (rs.next) insertedID = rs.getInt(1)

    if (insertedID == -1) {
      throw new RuntimeException("Error creating submission. Please contact administrator.")
    }

    insertedID
  }

  /**
    * print Task Results
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return JAVA Map
    */
  def getTaskResults(taskid: Int, user: User): util.List[util.Map[String, String]] = {
    val prparStmt = this.mysqlConnector.prepareStatement(
      "SELECT * from task join submission using(taskid) where taskid = ? and userid = ?;")
    prparStmt.setInt(1, taskid)
    prparStmt.setInt(2, user.userid)
    val resultSet = prparStmt.executeQuery()
    var taskList = new ListBuffer[java.util.Map[String, String]]()

    val resultIterator = new Iterator[ResultSet] {
      def hasNext: Boolean = resultSet.next()
      def next(): ResultSet = resultSet
    }.toStream

    for (res <- resultIterator.iterator) {
      taskList += Map(taskDBLabels.courseid -> res.getString(taskDBLabels.courseid),
        taskDBLabels.taskid -> res.getString(taskDBLabels.taskid),
        taskDBLabels.name -> res.getString(taskDBLabels.name),
        submissionDBLabels.result -> res.getString(submissionDBLabels.result),
        submissionDBLabels.submissionid -> res.getString(submissionDBLabels.submissionid),
        submissionDBLabels.userid -> res.getString(submissionDBLabels.userid)).asJava
    }

    taskList.toList.asJava

  }

  /**
    * print detail information of a given task
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return JAVA Map
    */
  def getTaskDetails(taskid: Integer, user: User):util.Map[String, String] = {
    // TODO check if user has this course where the task is from
    val prparStmt = this.mysqlConnector.prepareStatement(
      "SELECT `task`.`name`, `task`.`description`, `task`.`taskid`, `task`.`courseid` from task join courses using(courseid) where taskid = ? and userid = ?;")
    prparStmt.setInt(1, taskid)
    prparStmt.setInt(2, user.userid)
    val resultSet = prparStmt.executeQuery()
    if(resultSet.next())
      {
        Map(taskDBLabels.courseid -> resultSet.getString(taskDBLabels.courseid),
          taskDBLabels.taskid -> resultSet.getString(taskDBLabels.taskid),
          taskDBLabels.name -> resultSet.getString(taskDBLabels.name),
          taskDBLabels.description -> resultSet.getString(taskDBLabels.description)).asJava
      }
    else{
      throw new BadRequestException("Task '" + taskid + "' is not available.")
    }

  }

  /**
    * for a given Taskid and submissionid set a result text
    *
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param submissionid unique identification for a submissionid
    * @param result answer coming from a checker service
    * @return Boolean: did update work
    */
  def setResultOfTask(taskid: Integer, submissionid: Integer, result: String):Boolean = {
    val prparStmt = this.mysqlConnector.prepareStatement(
      "UPDATE submission set result = ? where taskid = ? and submissionid = ?;")
    prparStmt.setString(1, result)
    prparStmt.setInt(2, taskid)
    prparStmt.setInt(3, submissionid)

    prparStmt.execute()
  }

}
