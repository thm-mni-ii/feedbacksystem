package de.thm.ii.fbs.services.persistance

import de.thm.ii.fbs.model.{CourseResult, Task, TaskResult}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.sql.ResultSet

/**
  *
  */
@Component
class CourseResultService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  @Autowired
  private val courseRegistration: CourseRegistrationService = null

  /**
    * Get All Course Results
    * @param cid Course id
    * @return all Course Results
    */
  def getAll(cid: Int): List[CourseResult] = DB.query("SELECT user_id, prename, surname, email, username, global_role, alias," +
    " group_concat(CONCAT_WS(\";\", attempts, passed, task_id, name, description, deadline, media_type) ORDER BY task_id) as results, " +
    "(count(CASE WHEN passed >= 1 THEN 1 END) = count(task_id)) as \"passed\" " +
    "from (SELECT *, count(DISTINCT submission_id) as \"attempts\", count(CASE WHEN exit_code = 0 THEN 1 END) as \"passed\" " +
    "from user LEFT JOIN user_course using (user_id) " +
    "JOIN task using (course_id) " +
    "LEFT JOIN user_task_submission using (user_id, task_id) " +
    "LEFT join checkrunner_configuration using (task_id) " +
    "LEFT JOIN checker_result using (submission_id, configuration_id) " +
    "where course_id = ? group by user_id, task_id order by task_id, user_id) results group by user_id;", (res, _) => parseResult(res), cid)

  private def parseResult(res: ResultSet): CourseResult = CourseResult(
    courseRegistration.parseUserResult(res), res.getBoolean("passed"), parseTasksResult(res.getString("results"))
  )

  private def parseTasksResult(tasks: String): List[TaskResult] = {
    if (tasks == null) {
      List.empty[TaskResult]
    } else {
      tasks.split(",").map(parseTaskResult).toList
    }
  }

  private def parseTaskResult(taskResult: String): TaskResult = {
    val taskList = taskResult.split(";")
    val task = Task(
      id = Integer.parseInt(taskList(2)),
      name = taskList(3),
      description = taskList(4),
      deadline = taskList(5),
      mediaType = if (taskList.length > 6) taskList(6) else ""
    )

    TaskResult(task, Integer.parseInt(taskList(0)), Integer.parseInt(taskList(1)) >= 1)
  }
}
