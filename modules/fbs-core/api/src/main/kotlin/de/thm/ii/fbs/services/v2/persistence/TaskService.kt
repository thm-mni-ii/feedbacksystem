package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.Task
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.sql.ResultSet
import java.sql.Timestamp
import java.time.Instant
import java.time.format.DateTimeFormatter

/**
 * Handles the persistant task state
 */
@Component
class TaskService {
    @Autowired
    lateinit var jdbc: JdbcTemplate

    /**
     * Get all tasks of a course
     *
     * @param cid Course id
     * @return List of tasks
     */
    fun getAll(cid: Int): List<Task>
    DB.query("SELECT task_id, name, is_private, media_type, description, deadline, media_information, course_id, requirement_type , attempts ,hide_result" +
    " FROM task WHERE course_id = ?",
    (res, _) => parseResult(res), cid)

    /**
     * Lookup task by id
     *
     * @param id The users id
     * @return The found task
     */
    fun getOne(id: Int): Task? =
    DB.query("SELECT task_id, name, is_private, media_type, description, deadline, media_information, course_id," +
    " requirement_type, attempts ,hide_result FROM task WHERE task_id = ?",
    (res, _) => parseResult(res), id).headOption

    /**
     * Create a new task
     *
     * @param cid  Course id
     * @param task The task
     * @return The created task with id
     */
    fun create(cid: Int, task: Task): Task =
    DB.insert("INSERT INTO task (name, is_private, media_type, description, deadline, " +
    "media_information, course_id, requirement_type, attempts,hide_result) VALUES " +
    "(?, ?, ?, ?, ?, ?, ?, ?,?,?);",
    task.name, task.isPrivate, task.mediaType, task.description,
    parseTimestamp(task.deadline).orNull, task.mediaInformation.map(mi => MediaInformation.toJSONString(mi)).orNull,
    cid, task.requirementType, task.attempts.orNull, task.hideResult)
    .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
    .flatMap(id => getOne(id)) match {
        case Some(task) => task
        case None => throw new SQLException("Task could not be created")
    }

    /**
     * Update a task
     *
     * @param cid  The course id
     * @param tid  The task id
     * @param task The task
     * @return True if successful
     */
    fun update(cid: Int, tid: Int, task: Task): Boolean =
    1 == DB.update(
    """
        |UPDATE task SET name = ?, is_private = ?, media_type = ?, description = ?, deadline = ?, media_information = ?,
        |requirement_type = ?, attempts = ?, hide_result = ?
        |WHERE task_id = ? AND course_id = ?
        |""".stripMargin,
    task.name, task.isPrivate, task.mediaType, task.description, parseTimestamp(task.deadline).orNull,
    task.mediaInformation.map(mi => MediaInformation.toJSONString(mi)).orNull, task.requirementType, task.attempts.orNull, task.hideResult, tid, cid)

    /**
     * Delete a task by id
     *
     * @param cid The curse id
     * @param tid The task id
     * @return True if successful
     */
    fun delete(cid: Int, tid: Int): Boolean = 1 == DB.update("DELETE FROM task WHERE task_id = ? AND course_id = ?", tid, cid)

    /**
     * Get The task results for a course
     *
     * @param cid The id of the course to get the task results for
     * @param uid The uid of the user to get the user id for
     * @return UserTaskResult The UserTaskResult Array
     */
    fun getTaskResults(cid: Int, uid: Int): Sequence<UserTaskResult> = DB.query(
    """
      |SELECT task.task_id, task.is_private, submission.submission_id,
      |COALESCE(MIN(submission.status), 1) AS status, COALESCE(MAX(submission.points), 0) AS points,
      |       COALESCE(subtask.points, 0) AS max_points FROM task LEFT JOIN (
      |    SELECT uts.task_id, uts.submission_id, COALESCE(LEAST(MAX(cr.exit_code), 1), 1) AS status, SUM(cstr.points) AS points FROM user_task_submission uts
      |        LEFT JOIN checker_result cr on uts.submission_id = cr.submission_id
      |        LEFT JOIN checkrunner_sub_task_result cstr on cr.configuration_id = cstr.configuration_id and cr.submission_id = cstr.submission_id
      |    WHERE uts.user_id = ? GROUP BY uts.submission_id
      |) AS submission ON task.task_id = submission.task_id
      |LEFT JOIN (
      |    SELECT cc.task_id, SUM(cst.points) AS points FROM checkrunner_configuration cc
      |        LEFT JOIN checkrunner_sub_task cst on cc.configuration_id = cst.configuration_id
      |        GROUP BY cc.task_id
      |) AS subtask ON task.task_id = subtask.task_id WHERE task.course_id = ? GROUP BY task.task_id;
      |""".stripMargin, (res, _) => parseUserTaskResult(res), uid, cid)

    /**
     * Get The task result for a task
     *
     * @param tid The id of the the task results for
     * @param uid The uid of the user to get the user id for
     * @return UserTaskResult The UserTaskResult Array
     */
    fun getTaskResult(tid: Int, uid: Int): UserTaskResult? = DB.query(
    """
      |SELECT task.task_id, task.is_private, submission.submission_id,
      |COALESCE(MIN(submission.status), 1) AS status, COALESCE(MAX(submission.points), 0) AS points,
      |       COALESCE(subtask.points, 0) AS max_points FROM task LEFT JOIN (
      |    SELECT uts.task_id, uts.submission_id, COALESCE(LEAST(MAX(cr.exit_code), 1), 1) AS status, SUM(cstr.points) AS points FROM user_task_submission uts
      |        LEFT JOIN checker_result cr on uts.submission_id = cr.submission_id
      |        LEFT JOIN checkrunner_sub_task_result cstr on cr.configuration_id = cstr.configuration_id and cr.submission_id = cstr.submission_id
      |    WHERE uts.user_id = ? GROUP BY uts.submission_id
      |) AS submission ON task.task_id = submission.task_id
      |LEFT JOIN (
      |    SELECT cc.task_id, SUM(cst.points) AS points FROM checkrunner_configuration cc
      |        LEFT JOIN checkrunner_sub_task cst on cc.configuration_id = cst.configuration_id
      |        GROUP BY cc.task_id
      |) AS subtask ON task.task_id = subtask.task_id WHERE task.task_id = ? GROUP BY task.task_id LIMIT 1;
      |""".stripMargin, (res, _) => parseUserTaskResult(res), uid, tid).headOption

    /**
     * Get the subtask statistics for a single course
     *
     * @param cid the id of the course to get the statistics for
     * @return the statistics
     */
    fun getCourseSubtaskStatistics(cid: Int): Sequence<SubtaskStatisticsTask> = DB.query(
    """
      |SELECT task.task_id, task.name, (
      |    SELECT JSON_ARRAYAGG(JSON_OBJECT('name', cst.name, 'maxPoints', cst.points, 'avgPoints', (
      |            SELECT AVG(cstr.points) FROM (SELECT MAX(cstr.points) AS points
      |                                          FROM checkrunner_sub_task_result cstr
      |                                                   JOIN checker_result cr
      |                                                        on cstr.configuration_id = cr.configuration_id and
      |                                                           cstr.submission_id = cr.submission_id
      |                                                   JOIN user_task_submission uts on cr.submission_id = uts.submission_id
      |                                          WHERE cst.configuration_id = cstr.configuration_id
      |                                            AND cst.sub_task_id = cstr.sub_task_id
      |                                          GROUP BY uts.user_id
      |                                         ) cstr
      |        ))) FROM checkrunner_sub_task cst
      |    WHERE cc.configuration_id = cst.configuration_id
      |) AS subtasks FROM task
      |    JOIN checkrunner_configuration cc ON task.task_id = cc.task_id
      |WHERE course_id = ?;
      |""".stripMargin, (res, _) => parseSubtaskStatics(res), cid)

    private fun parseResult(res: ResultSet): Task = Task(name = res.getString("name"),
    isPrivate = res.getBoolean("is_private"),
    deadline = res.getTimestamp("deadline").toString(), mediaType = res.getString("media_type"),
    description = res.getString("description"), mediaInformation = MediaInformation.fromJSONString(res.getString("media_information")),
    requirementType = res.getString("requirement_type"), id = res.getInt("task_id"), courseID = res.getInt("course_id"),
    attempts = res.getInt("attempts").filter(_ => !res.wasNull()),
    hideResult = res.getBoolean("hide_result")
    )

    private fun parseUserTaskResult(res: ResultSet): UserTaskResult = UserTaskResult(res.getInt("task_id"),
    res.getInt("points"), res.getInt("max_points"), res.getInt("status") == 0, res.getString("submission_id") != null, res.getBoolean("is_private"))

    private fun parseSubtaskStatics(res: ResultSet): SubtaskStatisticsTask = SubtaskStatisticsTask1(res.getInt("task_id"),
    res.getString("name"), Option(res.getString("subtasks")).map(SubtaskStatisticsSubtask.fromJSONString).getOrElse(Seq()))

    private fun parseTimestamp(timestamp: String?): Timestamp? {
        return if(timestamp != null){
            Timestamp.from(Instant.from(DateTimeFormatter.ISO_DATE_TIME.parse(timestamp)))
        } else {
            null
        }
    }
}
