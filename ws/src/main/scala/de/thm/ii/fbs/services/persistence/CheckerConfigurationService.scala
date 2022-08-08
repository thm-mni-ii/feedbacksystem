package de.thm.ii.fbs.services.persistence

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}
import de.thm.ii.fbs.model.{CheckerTypeInformation, CheckrunnerConfiguration}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import scala.collection.immutable.Nil

/**
  * Handles checker configurations
  */
@Component
class CheckerConfigurationService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get a list of all checkrunner configurations for a task of a course
    * @param cid Course id
    * @param tid Task id
    * @return List of configurations
    */
  def getAll(cid: Int, tid: Int): List[CheckrunnerConfiguration] =
    DB.query("SELECT configuration_id, task_id, checker_type, main_file_uploaded, secondary_file_uploaded, ord, checker_type_information " +
      "FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "WHERE course_id = ? AND task_id = ? ORDER BY ord",
      (res, _) => parseResult(res), cid, tid)

  def getAllForSubmission(submissionID: Int): List[CheckrunnerConfiguration] =
  DB.query("SELECT configuration_id, t.task_id, checker_type, main_file_uploaded, secondary_file_uploaded, ord, checker_type_information " +
    "FROM user_task_submission JOIN task t on user_task_submission.task_id = t.task_id " +
    "JOIN checkrunner_configuration cc on t.task_id = cc.task_id WHERE submission_id = ? ORDER BY ord",
    (res, _) => parseResult(res), submissionID)

  /**
    * Get one checker configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Checker configuration id
    * @return Optional checker configuration
    */
  def find(cid: Int, tid: Int, ccid: Int): Option[CheckrunnerConfiguration] =
    DB.query("SELECT configuration_id, task_id, checker_type, main_file_uploaded, secondary_file_uploaded, ord, checker_type_information " +
      "FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) WHERE " +
      "course_id = ? AND task_id = ? AND configuration_id = ?",
      (res, _) => parseResult(res), cid, tid, ccid).headOption

  /**
    * Get one checker configuration by its id
    * @param ccid Checker configuration id
    * @return Optional checker configuration
    */
  def getOne(ccid: Int): Option[CheckrunnerConfiguration] =
    DB.query("SELECT configuration_id, task_id, checker_type, main_file_uploaded, secondary_file_uploaded, ord, checker_type_information " +
      "FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) WHERE configuration_id = ?",
      (res, _) => parseResult(res), ccid).headOption

  /**
    * Create a new checker configuration
    * @param cid Course id
    * @param tid Task id
    * @param cc Checker configuration
    * @return The current list of configurations
    */
  def create(cid: Int, tid: Int, cc: CheckrunnerConfiguration): CheckrunnerConfiguration =
    DB.insert("INSERT INTO checkrunner_configuration (task_id, checker_type, main_file_uploaded, " +
        "secondary_file_uploaded, ord, checker_type_information) VALUES (?,?,?,?,?,?);", tid, cc.checkerType,
      cc.mainFileUploaded, cc.secondaryFileUploaded, cc.ord, cc.checkerTypeInformation.map(CheckerTypeInformation.toJSONString).orNull)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(ccid => find(cid, tid, ccid)) match {
      case Some(configuration) => configuration
      case None => throw new SQLException("Configuration could not be created")
    }

  /**
    * Update a checker configuration
    * @param cid Course id
    * @param tid Task id
    * @param ccid Chekcrunner configuration id
    * @param cc Checkrunner configuration
    * @return True if successful
    */
  def update(cid: Int, tid: Int, ccid: Int, cc: CheckrunnerConfiguration): Boolean = {
    1 == DB.update("UPDATE checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "SET checker_type = ?, main_file_uploaded = ?, secondary_file_uploaded = ?, ord = ?, checker_type_information = ? " +
      "WHERE course_id = ? AND task_id = ? AND configuration_id = ?",
      cc.checkerType, cc.mainFileUploaded, cc.secondaryFileUploaded, cc.ord,
      cc.checkerTypeInformation.map(CheckerTypeInformation.toJSONString).orNull, cid, tid, ccid)
  }

  /**
    * Set main file uploaded state
    * @param cid Course id
    * @param tid Task id
    * @param ccid Chekcrunner configuration id
    * @param state The state of the uploaded status.
    * @return True if successful
    */
  def setMainFileUploadedState(cid: Int, tid: Int, ccid: Int, state: Boolean): Boolean = {
    1 == DB.update("UPDATE checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "SET main_file_uploaded = ? WHERE course_id = ? AND task_id = ? AND configuration_id = ?", state, cid, tid, ccid)
  }

  /**
    * Set secondary file uploaded state
    * @param cid Course id
    * @param tid Task id
    * @param ccid Chekcrunner configuration id
    * @param state The state of the uploaded status.
    * @return True if successful
    */
  def setSecondaryFileUploadedState(cid: Int, tid: Int, ccid: Int, state: Boolean): Boolean = {
    1 == DB.update("UPDATE checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "SET secondary_file_uploaded = ? WHERE course_id = ? AND task_id = ? AND configuration_id = ?", state, cid, tid, ccid)
  }

  /**
    * Set checker type information
    * @param cid Course id
    * @param tid Task id
    * @param ccid Chekcrunner configuration id
    * @param checkerTypeInformation The checkerTypeInformation to set
    * @return True if successful
    */
  def setCheckerTypeInformation(cid: Int, tid: Int, ccid: Int, checkerTypeInformation: Option[CheckerTypeInformation]): Boolean = {
    1 == DB.update("UPDATE checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "SET checker_type_information = ? WHERE course_id = ? AND task_id = ? AND configuration_id = ?",
      checkerTypeInformation.map(CheckerTypeInformation.toJSONString).orNull, cid, tid, ccid)
  }

  /**
    * Delete a checker configuration
    * @param cid course  id
    * @param tid task id
    * @param ccid checker configuration
    * @return True if successful
    */
  def delete(cid: Int, tid: Int, ccid: Int): Boolean =
    1 == DB.update("DELETE checkrunner_configuration FROM checkrunner_configuration JOIN task USING (task_id) JOIN course " +
      "USING (course_id) WHERE course_id = ? AND task_id = ? AND configuration_id = ?", cid, tid, ccid)

  private def parseResult(res: ResultSet): CheckrunnerConfiguration = CheckrunnerConfiguration(
    taskId = res.getInt("task_id"),
    checkerType = res.getString("checker_type"),
    mainFileUploaded = res.getBoolean("main_file_uploaded"),
    secondaryFileUploaded = res.getBoolean("secondary_file_uploaded"),
    ord = res.getInt("ord"),
    checkerTypeInformation = Option(res.getString("checker_type_information")).map(CheckerTypeInformation.fromJSONString),
    id = res.getInt("configuration_id")
  )
}
