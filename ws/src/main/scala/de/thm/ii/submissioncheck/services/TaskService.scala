package de.thm.ii.submissioncheck.services

import java.sql.{Connection, SQLIntegrityConstraintViolationException, Statement}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import org.springframework.beans.factory.annotation.{Autowired, Configurable}
import org.springframework.context.annotation.Bean
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Enable communication with Tasks and their Results
  *
  * @author Benjamin Manns
  */
@Component
class TaskService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * Class holds all DB labels
    */

  /** holds all unique labels */
  val taskDBLabels = new TaskDBLabels()

  /**
    * Class holds all DB labels
    */
  class SubmissionDBLabels {
    /** DB Label "task_id" */
    val taskid: String = "task_id"

    /** DB Label "submission_id" */
    val submissionid: String = "submission_id"

    /** DB Label "result" */
    val result: String = "result"

    /** DB Label "userid" */
    val userid: String = "user_id"

    /** DB Label "passed" */
    val passed: String = "passed"
  }

  /** holds all unique labels */
  val submissionDBLabels = new SubmissionDBLabels()

  /**
    * submit a Task
    * @param taskid unique identification for a task
    * @param user requesting User
    * @param data submitted data from User
    * @return Submission ID
    */
  def submitTask(taskid: Int, user: User, data: String): Integer = {
    // TODO Check authorization for this taks!!
    // TODO save data into DB

    try {
      val (num, holder) = DB.update((con: Connection) => {
        val ps = con.prepareStatement(
          "INSERT INTO submission (task_id, user_id) VALUES (?,?);",
          Statement.RETURN_GENERATED_KEYS
        )
        ps.setInt(1, taskid)
        ps.setInt(2, user.userid)
        ps
      })
      val insertedId = holder.getKey.intValue()

      if (num == 0) {
        throw new RuntimeException("Error creating submission. Please contact administrator.")
      }

      insertedId
    }
    catch {
      // TODO use the SQLIntegrityConstraintViolationException or anything with SQL
      case _: Exception => {
        throw new ResourceNotFoundException
      }
    }
  }

  /**
    * print Task Results
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return JAVA Map
    */
  def getTaskResults(taskid: Int, user: User): List[Map[String, String]] = {
    DB.query("SELECT * from task join submission using(task_id) where task_id = ? and user_id = ?;",
      (res, _) => {
        Map(
          taskDBLabels.courseid -> res.getString(taskDBLabels.courseid),
          taskDBLabels.taskid -> res.getString(taskDBLabels.taskid),
          taskDBLabels.name -> res.getString(taskDBLabels.name),
          submissionDBLabels.result -> res.getString(submissionDBLabels.result),
          submissionDBLabels.passed -> res.getString(submissionDBLabels.passed),
          submissionDBLabels.submissionid -> res.getString(submissionDBLabels.submissionid),
          submissionDBLabels.userid -> res.getString(submissionDBLabels.userid)
        )
      }, taskid, user.userid)
  }

  /**
    * print detail information of a given task
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return JAVA Map
    */
  def getTaskDetails(taskid: Integer, user: User): Option[Map[String, String]] = {
    // TODO check if user has this course where the task is from
    val list = DB.query("SELECT `task`.`name`, `task`.`description`, `task`.`task_id`, `task`.`course_id` from task join course " +
      "using(course_id) where task_id = ? and owner = ?;",
      (res, _) => {
        Map(taskDBLabels.courseid -> res.getString(taskDBLabels.courseid),
          taskDBLabels.taskid -> res.getString(taskDBLabels.taskid),
          taskDBLabels.name -> res.getString(taskDBLabels.name),
          taskDBLabels.description -> res.getString(taskDBLabels.description)
        )
      }, taskid, user.userid)
    list.headOption
  }

  /**
    * for a given Taskid and submissionid set a result text
    *
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param submissionid unique identification for a submissionid
    * @param result answer coming from a checker service
    * @param passed tiny peace of status information (i.e. exitcode)
    * @return Boolean: did update work
    */
  def setResultOfTask(taskid: Integer, submissionid: Integer, result: String, passed: String): Boolean = {
    val num = DB.update(
      "UPDATE submission set result = ?, passed =  ? where task_id = ? and submission_id = ?;",
      result, passed, taskid, submissionid
    )
    num > 0
  }

  /**
    * get a JAVA List of Task by a given course id
    * @param courseid unique identification for a course
    * @return JAVA List
    */
  def getTasksByCourse(courseid: Int): List[Map[String, String]] = {
    DB.query("select * from task where course_id = ?",
      (res, _) => {
        Map(
          taskDBLabels.courseid -> res.getString(taskDBLabels.courseid),
          taskDBLabels.taskid -> res.getString(taskDBLabels.taskid),
          taskDBLabels.name -> res.getString(taskDBLabels.name),
          taskDBLabels.description -> res.getString(taskDBLabels.description)
        )
      }, courseid)
  }

  /**
    * create a task to a given course
    * @author Benjamin Manns
    * @param name Task name
    * @param description Task description
    * @param courseid Course where task is created for
    * @param filename test file for this task
    * @param test_type which test type is needed
    * @return Scala Map
    */
  def createTask(name: String, description: String, courseid: Int, filename: String, test_type: String): Map[String, Boolean] = {
    // TODO send bad request error
    val availableTypes = List("FILE", "STRING")
    if (!availableTypes.contains(test_type)) throw new BadRequestException(availableTypes + "as `test_type` is not implemented.")
    var num = DB.update("INSERT INTO task (name, description, course_id, filename, test_type) VALUES (?,?,?,?,?)",
      name, description, courseid, filename, test_type)
    Map("success" -> (num == 1))
  }
}
