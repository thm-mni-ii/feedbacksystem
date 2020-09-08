package de.thm.ii.fbs.services.persistance

import java.sql.{ResultSet, SQLException}

import de.thm.ii.fbs.model.CheckrunnerConfiguration
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
    DB.query("SELECT configuration_id, check_type, main_file_uploaded, secondary_file_uploaded, ord FROM checkrunner_configuration " +
      "JOIN task USING (task_id) JOIN course USING (course_id) WHERE course_id = ? AND task_id = ?",
      (res, _) => parseResult(res), cid, tid)

  /**
    * Create a new checker configuration
    * @param cid Course id
    * @param tid Task id
    * @param cc Checker configuration
    * @return The current list of configurations
    */
  def create(cid: Int, tid: Int, cc: CheckrunnerConfiguration): List[CheckrunnerConfiguration] =
    DB.query("SELECT DISTINCT task_id FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "WHERE course_id = ? AND task_id = ?", (res, _) => res.getInt("task_id"), cid, tid)
      .flatMap(_ => DB.insert("INSERT INTO checkrunner_configuration (task_id, checker_type, main_file_uploaded, " +
        "secondary_file_uploaded, ord) VALUES (?,?,?,?,?);",
          tid, cc.checkerType, cc.mainFileUploaded, cc.secondaryFileUploaded, cc.ord).toList)
      .flatMap(_ => getAll(cid, tid))
    match {
      case Nil => throw new SQLException("Configuration could not be created")
      case list: List[CheckrunnerConfiguration] => list
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
    1 == DB.update("UPDATE checker_configuration SET checker_type = ?, main_file_uploaded = ?, secondary_file_uploaded = ?, ord = ?" +
      " WHERE configuration_id IN (SELECT configuration_id FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
    "WHERE course_id = ? AND task_id = ? AND configuration_id = ?)",
    cc.checkerType, cc.mainFileUploaded, cc.secondaryFileUploaded, cid, tid, ccid)
  }

  /**
    * Delete a checker configuration
    * @param cid course  id
    * @param tid task id
    * @param ccid checker configuration
    * @return True if successful
    */
  def delete(cid: Int, tid: Int, ccid: Int): Boolean =
    1 == DB.update("DELETE FROM checkrunner_configuration WHERE configuration_id = ? AND configuration_id IN " +
      "(SELECT configuration_id FROM checkrunner_configuration JOIN task USING (task_id) JOIN course USING (course_id) " +
      "WHERE course_id = ? AND task_id = ? AND configuration_id = ?)", cid, tid, ccid)

  private def parseResult(res: ResultSet): CheckrunnerConfiguration = CheckrunnerConfiguration(
    checkerType = res.getString("checker_type"),
    mainFileUploaded = res.getBoolean("main_file_uploaded"),
    secondaryFileUploaded = res.getBoolean("secondary_file_uploaded"),
    ord = res.getInt("ord")
  )
}
