package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.{CourseResult, AnalysisCourseResult, TaskResult}
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
  @Autowired
  private val objectMapper: ObjectMapper = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Get All Course Results
    * @param cid Course id
    * @return all Course Results
    */
  def getAll(cid: Int, from: Int, to: Int): List[CourseResult] = DB.query("""
    |select u.user_id
    |     ,u.prename
    |     ,u.surname
    |     ,u.email
    |     ,u.username
    |     ,u.global_role
    |     ,u.alias
    |     ,JSON_ARRAYAGG(JSON_OBJECT("task", JSON_OBJECT("id", t.task_id,
    |                                                    "name", t.name,
    |                                                    "deadline", t.deadline,
    |                                                    "mediaType", t.media_type,
    |                                                    "description", t.description),
    |                                "attempts", coalesce(submissions.attempts, 0),
    |                                "passed", coalesce(submissions.passed, 0),
    |                                "points", coalesce(subtasks.points, 0)
    |    )) as results
    |     ,COALESCE(FLOOR(SUM(submissions.passed) / COUNT(DISTINCT t.task_id)), 0) as passed
    |     ,COALESCE(SUM(subtasks.points), 0) as points
    |from user u
    |         left join user_course uc using (user_id)
    |         left join task t using (course_id)
    |         left join (
    |             select temp.user_id
    |                   ,temp.task_id
    |                   ,count(distinct temp.submission_id) as attempts
    |                   ,max(temp.passed) as passed
    |                   ,max(temp.submission_id) as submission_id
    |             from (
    |                select uts.user_id
    |                      ,uts.task_id
    |                      ,uts.submission_id
    |                      ,IF(SUM(cr.exit_code) = 0, 1, 0) as passed
    |                from user_task_submission uts
    |                left join checker_result cr using (submission_id)
    |                group by uts.user_id, uts.task_id, uts.submission_id
    |                order by uts.user_id
    |             ) as temp
    |             group by temp.user_id, temp.task_id
    |         ) as submissions using (user_id, task_id)
    |         left join (
    |           select str.submission_id, SUM(str.points) as points from checkrunner_sub_task_result str left join
    |             checkrunner_sub_task cst on str.sub_task_id = cst.sub_task_id group by str.submission_id
    |         ) as subtasks on submissions.submission_id = subtasks.submission_id
    |where course_id = ? and uc.course_role between ? and ?
    |group by u.user_id
    |order by u.user_id;
    |""".stripMargin, (res, _) => parseResult(res), cid, from, to)

  /**
    * Get All Course Results by a Task
    * @param cid Course id
    * @param tid Task id
    * @return all Course Results
    */
  def getAllByTask(cid: Int, tid: Int): List[AnalysisCourseResult] = DB.query("""
      |select submission_id, task_id, DENSE_RANK() OVER(order by user_id) as user_id,
      |ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY submission_time) as attempt,
      |not exit_code as passed, result_text from user_task_submission
      |join checker_result using (submission_id)
      |join task using (task_id) where course_id = ? and task_id = ?
      |group by submission_id order by submission_time;
      |""".stripMargin, (res, _) => parseByTaskResult(res), cid, tid)

  private def parseResult(res: ResultSet): CourseResult = CourseResult(
    courseRegistration.parseUserResult(res), res.getBoolean("passed"),
    objectMapper.readValue(res.getString("results"), classOf[Array[TaskResult]]).toList.sorted
  )

  private def parseByTaskResult(res: ResultSet): AnalysisCourseResult = AnalysisCourseResult(
    submission = storageService.getSolutionFile(res.getInt("submission_id")),
    passed = res.getBoolean("passed"),
    resultText = res.getString("result_text"),
    userId = res.getInt("user_id"),
    attempt = res.getInt("attempt")
  )
}
