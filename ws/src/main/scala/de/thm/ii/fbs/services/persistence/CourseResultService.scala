package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.{CourseResult, TaskResult}
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
  private val mapper = new ObjectMapper

  /**
    * Get All Course Results
    * @param cid Course id
    * @return all Course Results
    */
  def getAll(cid: Int): List[CourseResult] = DB.query("SELECT user_id, prename, surname, email, username, global_role, alias, " +
    "JSON_ARRAYAGG(JSON_OBJECT(\"task\", JSON_OBJECT(\"id\", task_id, \"name\", name, \"deadline\", deadline, \"mediaType\", media_type, " +
    "\"description\", description), \"attempts\", attempts, \"passed\", passed)) as results, " +
    "(count(CASE WHEN passed >= 1 THEN 1 END) = count(task_id)) as \"passed\" from (SELECT *, count(DISTINCT submission_id) as \"attempts\", " +
    "count(CASE WHEN passed_checker >= 1 THEN 1 END) as passed " +
    "from (SELECT *, count(CASE WHEN exit_code = 0 THEN 1 END) = count(Distinct configuration_id) as \"passed_checker\" " +
    "from user LEFT JOIN user_course using (user_id) " +
    "JOIN task using (course_id) " +
    "LEFT JOIN user_task_submission using (user_id, task_id) " +
    "LEFT join checkrunner_configuration using (task_id) " +
    "LEFT JOIN checker_result using (submission_id, configuration_id) " +
    "where course_id = ? group by user_id, task_id, submission_id order by user_id, task_id) " +
    "results_by_submission group by user_id, task_id) results  group by user_id;", (res, _) => parseResult(res), cid)

  private def parseResult(res: ResultSet): CourseResult = {
    val tasks = mapper.readValue(res.getString("results"), classOf[Array[TaskResult]]).toList.sortBy(f => f.task.id)
    CourseResult(
      courseRegistration.parseUserResult(res), res.getBoolean("passed"), tasks
    )
  }
}
