package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CheckResult, Submission}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.UncategorizedSQLException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}
import java.util
import java.util.Date
import scala.collection.mutable

/**
  * Handles submission state
  */
@Component
class SubmissionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  private val objectMapper: ObjectMapper = new ObjectMapper()

  /**
    * Get all submission for a task by a user
    *
    * @param uid        User id
    * @param cid        Course id
    * @param tid        Task id
    * @param addExtInfo select Extended information if present?
    * @return List of submissions
    */
  def getAll(uid: Int, cid: Int, tid: Int, addExtInfo: Boolean = false): List[Submission] = reduceSubmissions(DB.query(
    s"SELECT submission_id, submission_time, configuration_id, exit_code, result_text, user_task_submission.is_in_block_storage, " +
      s"checker_type, additional_information${if (addExtInfo) ", ext_info" else ""} " +
      "FROM user_task_submission JOIN task USING(task_id) LEFT JOIN checker_result using (submission_id) " +
      "LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE user_id = ? AND course_id = ? AND user_task_submission.task_id = ?", (res, _) => parseResult(res), uid, cid, tid))

  /**
    * Get all submission for a task
    *
    * @param cid Course id
    * @param tid Task id
    * @return List of submissions
    */
  def getAllByTask(cid: Int, tid: Int): List[Submission] = reduceSubmissions(DB.query(
    "SELECT submission_id, user_id, submission_time, configuration_id, exit_code, result_text, user_task_submission.is_in_block_storage, checker_type, " +
      "additional_information FROM user_task_submission JOIN task USING(task_id) LEFT JOIN checker_result using (submission_id) " +
      "LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE course_id = ? AND user_task_submission.task_id = ?", (res, _) => parseResult(res, fetchUserId = true), cid, tid))

  /**
    * Lookup a submission by id
    *
    * @param id         The sumissions id
    * @param uid        The users id
    * @param addExtInfo select Extended information if present?
    * @return The found task
    */
  def getOne(id: Int, uid: Int, addExtInfo: Boolean = false): Option[Submission] = reduceSubmissions(DB.query(
    s"SELECT submission_id, submission_time, configuration_id, exit_code, result_text, user_task_submission.is_in_block_storage, " +
      s"checker_type, additional_information${if (addExtInfo) ", ext_info" else ""} " +
      "FROM user_task_submission LEFT JOIN checker_result using (submission_id) LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE submission_id = ? AND user_id = ?",
    (res, _) => parseResult(res), id, uid)).headOption

  /**
    * Lookup a submission by id
    *
    * @param id         The sumissions id
    * @param addExtInfo select Extended information if present?
    * @return The found submission
    */
  def getOneWithoutUser(id: Int, addExtInfo: Boolean = false): Option[Submission] = reduceSubmissions(DB.query(
    s"SELECT submission_id, user_id, submission_time, configuration_id, exit_code, result_text, user_task_submission.is_in_block_storage, " +
      s"checker_type, additional_information${if (addExtInfo) ", ext_info" else ""} " +
      "FROM user_task_submission LEFT JOIN checker_result using (submission_id) LEFT JOIN checkrunner_configuration using (configuration_id) " +
      "WHERE submission_id = ?",
    (res, _) => parseResult(res, fetchUserId = true), id)).headOption

  /**
    * Create a new submission
    *
    * @param uid the user id
    * @param tid The task id
    * @return The created Submission with id
    */
 def create(uid: Int, tid: Int, additionalInformation: Option[util.HashMap[String, Any]] = None): Submission =
    try {
      DB.insert("INSERT INTO user_task_submission (user_id, task_id, is_in_block_storage, additional_information) VALUES (?, ?, ?, ?)",
        uid, tid, true, additionalInformation.map(additionalInformation => objectMapper.writeValueAsString(additionalInformation)).orNull)
        .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
        .flatMap(id => getOne(id, uid)) match {
        case Some(submission) => submission
        case None => throw new SQLException("Submission could not be created")
      }
    } catch {
      case e: UncategorizedSQLException =>
        if (e.getSQLException.getSQLState == "45000") {
          throw new ForbiddenException("Number of tries exceeded")
        } else {
          throw e
        }
    }

  /**
    * Stores a result
    *
    * @param sid        The submission id
    * @param ccid       The check runner configuration id
    * @param exitCode   The exit Code of the runner
    * @param resultText The resultText of the runner
    * @param extInfo    Extended runner information
    */
  def storeResult(sid: Int, ccid: Int, exitCode: Int, resultText: String, extInfo: String): Unit =
    DB.insert("INSERT INTO checker_result (submission_id, configuration_id, exit_code, result_text, ext_info) " +
      "VALUES (?, ?, ?, ?, ?)", sid, ccid, exitCode, resultText, extInfo)

  /**
    * Removes all results stored for this submission
    *
    * @param sid The submission id
    * @param uid The user id
    * @return True if results where deleted
    */
  def clearResults(sid: Int, uid: Int): Boolean =
    0 < DB.update("DELETE checker_result FROM checker_result JOIN user_task_submission USING (submission_id) " +
      "WHERE submission_id = ? AND user_id = ?", sid, uid)

  /**
    * Delete a submission by id
    *
    * @param sid The submission id
    * @return True if successful
    */
  def delete(sid: Int): Boolean = 1 == DB.update("DELETE FROM user_task_submission WHERE submission_id = ?", sid)

  private def parseResult(res: ResultSet, fetchUserId: Boolean = false): Submission = Submission(
    id = res.getInt("submission_id"),
    submissionTime = new Date(res.getDate("submission_time").getTime),
    done = res.getObject("configuration_id") != null,
    userID = if (fetchUserId) Some(res.getInt("user_id")) else None,
    results = if (res.getObject("configuration_id") != null) {
      // Get Extended Information or null
      val extInfo = getStringOrElse(res, "ext_info", null)

      Array(CheckResult(
        exitCode = res.getInt("exit_code"),
        resultText = res.getString("result_text"),
        checkerType = res.getString("checker_type"),
        configurationId = res.getInt("configuration_id"),
        extInfo = if (extInfo != null) objectMapper.readTree(extInfo) else null
      ))
    } else {
      Array[CheckResult]()
    },
    isInBlockStorage = res.getBoolean("is_in_block_storage"),
    additionalInformation = Option(res.getString("additional_information"))
      .map(s => objectMapper.readValue(s, classOf[util.HashMap[String, Any]]))
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

  private def getStringOrElse(resultSet: ResultSet, key: String, defaultValue: String): String = {
    try {
      resultSet.getString(key)
    } catch {
      case _: SQLException => defaultValue
    }
  }

  def getOrHidden(submission: Submission, hideResult: Boolean, adminPrivileged: Boolean): Submission = {
    if (hideResult && !adminPrivileged) {
      Submission(submission.submissionTime, submission.done, submission.id, isHidden = true, additionalInformation = None)
    } else {
      submission
    }
  }
}
