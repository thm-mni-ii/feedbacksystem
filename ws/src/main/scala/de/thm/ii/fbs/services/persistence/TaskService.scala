package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model.{MediaInformation, Task}
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
    DB.query("SELECT task_id, name, media_type, description, deadline, media_information, course_id FROM task WHERE course_id = ?", (res, _) => parseResult(res), cid)

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
    1 == DB.update("UPDATE task SET name = ?, media_type = ?, description = ?, deadline = ? WHERE task_id = ? AND course_id = ?",
      task.name, task.mediaType, task.description, parseTimestamp(task.deadline), tid, cid)

  /**
    * Delete a task by id
    *
    * @param cid The curse id
    * @param tid The task id
    * @return True if successful
    */
  def delete(cid: Int, tid: Int): Boolean = 1 == DB.update("DELETE FROM task WHERE task_id = ? AND course_id = ?", tid, cid)

  private def parseResult(res: ResultSet): Task = Task(name = res.getString("name"), deadline = res.getTimestamp("deadline").toInstant.toString, mediaType = res.getString("media_type"), description = res.getString("description"), mediaInformation = Option(res.getString("media_information")).map(mi => MediaInformation.fromJSONString(mi)), id = res.getInt("task_id"))

  private def parseTimestamp(timestamp: String): Timestamp = Timestamp.from(Instant.from(DateTimeFormatter.ISO_DATE_TIME.parse(timestamp)))
}
