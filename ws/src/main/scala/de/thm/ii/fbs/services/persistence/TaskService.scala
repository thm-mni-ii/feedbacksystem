package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model.{MediaInformation, Task, TaskResult, UserTaskResult}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.math.BigInteger
import java.sql.{ResultSet, SQLException, Timestamp}
import java.time.Instant
import java.time.format.DateTimeFormatter

/**
  * Handles the persistant task state
  */
@Component
class TaskService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all tasks of a course
    *
    * @param cid Course id
    * @return List of tasks
    */
  def getAll(cid: Int): List[Task] =
    DB.query("SELECT task_id, name, media_type, description, deadline, media_information, course_id FROM task WHERE course_id = ?",
      (res, _) => parseResult(res), cid)

  /**
    * Lookup task by id
    *
    * @param id The users id
    * @return The found task
    */
  def getOne(id: Int): Option[Task] =
    DB.query("SELECT task_id, name, media_type, description, deadline, media_information, course_id FROM task WHERE task_id = ?",
      (res, _) => parseResult(res), id).headOption

  /**
    * Create a new task
    * @param cid Course id
    * @param task The task
    * @return The created task with id
    */
  def create(cid: Int, task: Task): Task =
    DB.insert("INSERT INTO task (name, media_type, description, deadline, media_information, course_id) VALUES " +
      "(?, ?, ?, ?, ?, ?);",
      task.name, task.mediaType, task.description,
      parseTimestamp(task.deadline), task.mediaInformation.map(mi => MediaInformation.toJSONString(mi)).orNull, cid)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => getOne(id)) match {
      case Some(task) => task
      case None => throw new SQLException("Task could not be created")
    }

  /**
    * Update a task
    * @param cid The curse id
    * @param tid The task id
    * @param task The task
    * @return True if successful
    */
  def update(cid: Int, tid: Int, task: Task): Boolean =
    1 == DB.update("UPDATE task SET name = ?, media_type = ?, description = ?, deadline = ?, media_information = ? WHERE task_id = ? AND course_id = ?",
      task.name, task.mediaType, task.description, parseTimestamp(task.deadline),
      task.mediaInformation.map(mi => MediaInformation.toJSONString(mi)).orNull, tid, cid)

  /**
    * Delete a task by id
    *
    * @param cid The curse id
    * @param tid The task id
    * @return True if successful
    */
  def delete(cid: Int, tid: Int): Boolean = 1 == DB.update("DELETE FROM task WHERE task_id = ? AND course_id = ?", tid, cid)

  /**
    * Get The task results for a course
    * @param cid The id of the course to get the task results for
    * @param uid The uid of the user to get the user id for
    * @return UserTaskResult The UserTaskResult Array
    */
  def getTaskResults(cid: Int, uid: Int): Seq[UserTaskResult] = DB.query(
    """SELECT task.task_id, uts.submission_id, COALESCE(SUM(cstr.points), 0) AS points, COALESCE(SUM(cst.points), 0) AS max_points,
      |       COALESCE(LEAST(cr.exit_code, 1), 1) AS status FROM task
      |    LEFT JOIN checkrunner_configuration cc on task.task_id = cc.task_id
      |    LEFT JOIN checkrunner_sub_task cst on cc.configuration_id = cst.configuration_id
      |    LEFT JOIN user_task_submission uts ON uts.task_id = task.task_id AND uts.user_id = ?
      |    LEFT JOIN checkrunner_sub_task_result cstr ON cst.configuration_id = cstr.configuration_id AND
      |                                                  cst.sub_task_id = cstr.sub_task_id AND cstr.submission_id = uts.submission_id
      |    LEFT JOIN checker_result cr ON cc.configuration_id = cr.configuration_id AND
      |                                   uts.submission_id = cr.submission_id
      |    WHERE course_id = ? AND (uts.submission_id IS NULL OR uts.submission_id = (
      |        SELECT MAX(sub.submission_id) FROM user_task_submission sub WHERE sub.task_id = task.task_id AND sub.user_id = uts.user_id
      |    )) GROUP BY task.task_id;
      """.stripMargin, (res, _) => parseUserTaskResult(res), uid, cid)

  /**
    * Get The task result for a task
    * @param tid The id of the the task results for
    * @param uid The uid of the user to get the user id for
    * @return UserTaskResult The UserTaskResult Array
    */
  def getTaskResult(tid: Int, uid: Int): Option[UserTaskResult] = DB.query(
  """SELECT task.task_id, uts.submission_id, COALESCE(SUM(cstr.points), 0) AS points, COALESCE(SUM(cst.points), 0) AS max_points,
    |       COALESCE(LEAST(cr.exit_code, 1), 1) AS status FROM task
    |    LEFT JOIN checkrunner_configuration cc on task.task_id = cc.task_id
    |    LEFT JOIN checkrunner_sub_task cst on cc.configuration_id = cst.configuration_id
    |    LEFT JOIN user_task_submission uts ON uts.task_id = task.task_id AND uts.user_id = ?
    |    LEFT JOIN checkrunner_sub_task_result cstr ON cst.configuration_id = cstr.configuration_id AND
    |                                                  cst.sub_task_id = cstr.sub_task_id AND cstr.submission_id = uts.submission_id
    |    LEFT JOIN checker_result cr ON cc.configuration_id = cr.configuration_id AND
    |                                   uts.submission_id = cr.submission_id
    |    WHERE task.task_id = ? AND (uts.submission_id IS NULL OR uts.submission_id = (
    |        SELECT MAX(sub.submission_id) FROM user_task_submission sub WHERE sub.task_id = task.task_id AND sub.user_id = uts.user_id
    |    )) GROUP BY task.task_id;
    |""".stripMargin, (res, _) => parseUserTaskResult(res), uid, tid).headOption

  private def parseResult(res: ResultSet): Task = Task(name = res.getString("name"),
    deadline = res.getTimestamp("deadline").toInstant.toString, mediaType = res.getString("media_type"),
    description = res.getString("description"), mediaInformation = Option(res.getString("media_information")).map(mi => MediaInformation.fromJSONString(mi)),
    id = res.getInt("task_id"))

  private def parseUserTaskResult(res: ResultSet): UserTaskResult = UserTaskResult(res.getInt("task_id"),
    res.getInt("points"), res.getInt("max_points"), res.getInt("status") == 0, res.getString("submission_id") != null)

  private def parseTimestamp(timestamp: String): Timestamp = Timestamp.from(Instant.from(DateTimeFormatter.ISO_DATE_TIME.parse(timestamp)))
}
