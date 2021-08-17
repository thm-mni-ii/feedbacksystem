package de.thm.ii.fbs.services.checker

import com.fasterxml.jackson.databind.json.JsonMapper
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SpreadsheetMediaInformation, User}
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.util.Hash
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.io.File
import java.util.{Map => UtilMap}
import scala.collection.mutable

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
  @Autowired
  private val subTaskService: CheckrunnerSubTaskService = null

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

    val (correctCount, results) = this.check(fields, submittedFields, spreadsheetMediaInformation.decimals)

    val exitCode = if (correctCount == fields.length) {0} else {1}
    val resultText = this.generateResultText(results)

    val extInfo = new JsonMapper().writeValueAsString(submittedFields)
    submissionService.storeResult(submission.id, cc.id, exitCode, resultText, extInfo)
    this.submittSubTasks(cc.id, submissionID, results)
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

  private def check(fields: Seq[(String, String)], submittedFields: UtilMap[String, String], decimals: Int): (Int, Seq[CheckResult]) = {
    var result = mutable.ListBuffer[CheckResult]()
    var correctCount = 0

    for ((key, value) <- fields) {
      val enteredValue = submittedFields.get(key)
      var correct = false
      if (enteredValue != null && roundIfNumber(enteredValue, decimals) == roundIfNumber(value, decimals)) {
        correct = true
        correctCount += 1
      }
      result = result.appended(CheckResult(key, value, enteredValue, correct))
    }

    (correctCount, result.toList)
  }

  private def generateResultText(results: Seq[CheckResult]): String = {
    val resultString = new StringBuilder()

    for (CheckResult(key, _, enteredValue, correct) <- results) {
      if (enteredValue == null || enteredValue == "") {
        resultString ++= key + " Keine Abgabe"
      } else {
        resultString ++= key + " = " + enteredValue
        if (correct) {
          resultString ++= " RICHTIG"
        } else {
          resultString ++= " FALSCH"
        }
      }
      resultString ++= "\n"
    }

    resultString.toString()
  }

  private def submittSubTasks(configurationId: Int, submissionId: Int, results: Seq[SpreadsheetCheckerService.this.CheckResult]): Unit = {
    for (CheckResult(key, _, _, correct) <- results) {
      val points = if (correct) {1} else {0}

      val subTask = subTaskService.getOrCrate(configurationId, key, 1)
      subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    }
  }

  private def roundIfNumber(input: String, toDecimals: Int): String = {
    input.toDoubleOption match {
      case Some(double) => BigDecimal(double).setScale(toDecimals, BigDecimal.RoundingMode.HALF_UP).toString()
      case None => input
    }
  }

  private case class CheckResult(name: String, expected: String, entered: String, correct: Boolean)
}
