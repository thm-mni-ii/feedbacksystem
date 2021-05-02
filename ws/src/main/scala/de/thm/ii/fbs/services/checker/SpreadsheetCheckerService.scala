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
    val submission = this.submissionService.getOne(submissionID, fu.id).get

    val fields = this.getFields(cc.id, task.mediaInformation.get, fu.username)
    val submittedFields = this.getSubmittedFields(submission.id)

    val (exitCode, resulText) = this.check(fields, submittedFields)

    submissionService.storeResult(submission.id, cc.id, exitCode, resulText, null)
  }

  private def getFields(ccID: Int, mediaInformation: MediaInformation, username: String): Seq[(String, String)] = {
    val path = this.storageService.pathToMainFile(ccID).get.toString
    val spreadsheetFile = new File(path)

    val spreadsheetMediaInformation = mediaInformation.asInstanceOf[SpreadsheetMediaInformation]
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

  private def check(fields: Seq[(String, String)], submittedFields: UtilMap[String, String]): (Int, String) = {
    val result = new StringBuilder()
    var correctCount = 0

    for ((key, value) <- fields) {
      val enteredValue = submittedFields.get(key)
      result ++= key + " = " + enteredValue
      if (roundIfNumber(enteredValue) == roundIfNumber(value)) {
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

  private def roundIfNumber(input: String): String = {
    input.toDoubleOption match {
      case Some(double) => BigDecimal(double).setScale(2, BigDecimal.RoundingMode.HALF_UP).toString()
      case None => input
    }
  }
}
