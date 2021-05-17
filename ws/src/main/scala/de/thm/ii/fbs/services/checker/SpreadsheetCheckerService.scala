package de.thm.ii.fbs.services.checker

import java.io.File
import java.util.{Map => UtilMap}

import com.fasterxml.jackson.databind.json.JsonMapper
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, MediaInformation, SpreadsheetMediaInformation, User}
import de.thm.ii.fbs.services.persistance.{CheckerConfigurationService, StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.util.Hash
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

/**
  * A Spreadsheet Checker
  */
@Service
class SpreadsheetCheckerService extends CheckerService {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val spreadsheetService: SpreadsheetService = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Handles the submission notification
    * @param taskID the taskID for the submission
    * @param submissionID the id of the sumission
    * @param cc the check runner of the sumission
    * @param fu the user which triggered the sumission
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val task = this.taskService.getOne(taskID).get
    val spreadsheetMediaInformation = task.mediaInformation.get.asInstanceOf[SpreadsheetMediaInformation]
    val submission = this.submissionService.getOne(submissionID, fu.id).get

    val fields = this.getFields(cc.id, spreadsheetMediaInformation, fu.username)
    val submittedFields = this.getSubmittedFields(submission.id)

    val (exitCode, resulText) = this.check(fields, submittedFields, spreadsheetMediaInformation.decimals)

    submissionService.storeResult(submission.id, cc.id, exitCode, resulText, null)
  }

  private def getFields(ccID: Int, spreadsheetMediaInformation: SpreadsheetMediaInformation, username: String): Seq[(String, String)] = {
    val path = this.storageService.pathToMainFile(ccID).get.toString
    val spreadsheetFile = new File(path)

    val userID = Hash.decimalHash(username).abs().toString().slice(0, 7)

    val fields = this.spreadsheetService.getFields(spreadsheetFile, spreadsheetMediaInformation.idField, userID, spreadsheetMediaInformation.outputFields)
    fields
  }

  private def getSubmittedFields(submissionID: Int): UtilMap[String, String] = {
    val submissionPath = this.storageService.pathToSolutionFile(submissionID).get.toString
    val submissionFile = new File(submissionPath)

    val mapper = new JsonMapper()
    val resultFields = mapper.readValue(submissionFile, classOf[UtilMap[String, String]])
    resultFields
  }

  private def check(fields: Seq[(String, String)], submittedFields: UtilMap[String, String], decimals: Int): (Int, String) = {
    val result = new StringBuilder()
    var correctCount = 0

    for ((key, value) <- fields) {
      val enteredValue = submittedFields.get(key)
      result ++= key + " = " + enteredValue
      if (roundIfNumber(enteredValue, decimals) == roundIfNumber(value, decimals)) {
        result ++= " RICHTIG"
        correctCount += 1
      } else {
        result ++= " FALSCH"
      }
      result ++= "\n"
    }

    val exitCode = if (correctCount == fields.size) 0 else 1

    (exitCode, result.toString())
  }

  private def roundIfNumber(input: String, toDecimals: Int): String = {
    input.toDoubleOption match {
      case Some(double) => BigDecimal(double).setScale(toDecimals, BigDecimal.RoundingMode.HALF_UP).toString()
      case None => input
    }
  }
}
