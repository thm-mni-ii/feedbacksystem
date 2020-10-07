package de.thm.ii.fbs.services.persistance

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}
import java.util.Date

import de.thm.ii.fbs.model.{CheckResult, Submission, Task}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import scala.collection.mutable

/**
  * Handles submission state
  */
@Component
class SubmissionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all submission for a task by a user
    * @param uid User id
    * @param cid Course id
    * @param tid Task id
    * @return List of submissions
    */
  def getAll(uid: Int, cid: Int, tid: Int): List[Submission] = reduceSubmissions(DB.query(
    "SELECT submission_id, submission_time, configuration_id, exit_code, result_text, checker_type " +
      "FROM user_task_submission JOIN task USING(task_id) LEFT JOIN checker_result using (submission_id) " +
      "LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE user_id = ? AND course_id = ? AND user_task_submission.task_id = ?", (res, _) => parseResult(res), uid, cid, tid))

  /**
    * Lookup a submission by id
    * @param id The users id
    * @return The found task
    */
  def getOne(id: Int): Option[Submission] =
    reduceSubmissions(DB.query("SELECT submission_id, submission_time, configuration_id, exit_code, result_text, checker_type " +
      "FROM user_task_submission LEFT JOIN checker_result using (submission_id) LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE submission_id = ?",
      (res, _) => parseResult(res), id)).headOption

  /**
    * Create a new submission
    * @param uid the user id
    * @param tid The task id
    * @return The created Submission with id
    */
  def create(uid: Int, tid: Int): Submission =
    DB.insert("INSERT INTO user_task_submission (user_id, task_id) VALUES (?, ?)", uid, tid)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => getOne(id)) match {
      case Some(submission) => submission
      case None => throw new SQLException("Submission could not be created")
    }

  /**
    * Stores a result
    * @param sid The submission id
    * @param ccid The check runner configuration id
    * @param exitCode The exit Code of the runner
    * @param resultText The resultText of the runner
    */
  def storeResult(sid: Int, ccid: Int, exitCode: Int, resultText: String): Unit =
    DB.insert("INSERT INTO checker_result (submission_id, configuration_id, exit_code, result_text) " +
      "VALUES (?, ?, ?, ?)", sid, ccid, exitCode, resultText)

  /**
    * Delete a submission by id
    * @param sid The submission id
    * @return True if successful
    */
  def delete(sid: Int): Boolean = 1 == DB.update("DELETE FROM user_task_submission WHERE submission_id = ?", sid)

  private def parseResult(res: ResultSet): Submission = Submission(
    id = res.getInt("submission_id"),
    submissionTime = new Date(res.getDate("submission_time").getTime),
    done = res.getObject("configuration_id") != null,
    results = if (res.getObject("configuration_id") != null) {
      Array(CheckResult(
        exitCode = res.getInt("exit_code"),
        resultText = res.getString("result_text"),
        checkerType = res.getString("checker_type"),
        configurationId = res.getInt("configuration_id")
      ))
    } else {Array[CheckResult]()}
  )

  private def reduceSubmissions(submissions: List[Submission]): List[Submission] = {
    val submissionsMap = new mutable.LinkedHashMap[Int, Submission]()
    submissions.foreach(submission => {
      submissionsMap(submission.id) = submissionsMap.get(submission.id) match {
        case Some(current) => current.copy(results = current.results ++ submission.results)
        case None => submission
      }
    })
    submissionsMap.values.toList
  }
}
