package de.thm.ii.fbs.services.checker.math

import com.fasterxml.jackson.databind.json.JsonMapper
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SpreadsheetMediaInformation, User}
import de.thm.ii.fbs.services.checker.`trait`.CheckerService
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.util.Hash
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.io.File
import java.text.{NumberFormat, ParseException, ParsePosition}
import java.util.{Locale, Map => UtilMap}
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
  @Autowired
  private val mathParserService: MathParserService = null

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

    val fields = this.getFields(cc.id, spreadsheetMediaInformation, fu.username, spreadsheetMediaInformation.outputFields)
    val pointFields = spreadsheetMediaInformation.pointFields.map(pointsFields => this.getFields(cc.id, spreadsheetMediaInformation, fu.username, pointsFields))
    val submittedFields = this.getSubmittedFields(submission.id)

    val (correctCount, results) = this.check(fields, submittedFields, spreadsheetMediaInformation.decimals)

    val exitCode = if (correctCount == fields.length) {0} else {1}
    val resultText = this.generateResultText(results)

    val extInfo = new JsonMapper().writeValueAsString(submittedFields)
    submissionService.storeResult(submission.id, cc.id, exitCode, resultText, extInfo)
    this.submittSubTasks(cc.id, submissionID, results, pointFields)
  }

  private def getFields(ccID: Int, spreadsheetMediaInformation: SpreadsheetMediaInformation, username: String, fields: String): Seq[(String, String)] = {
    val path = this.storageService.pathToMainFile(ccID).get.toString
    val spreadsheetFile = new File(path)

    val userID = Hash.decimalHash(username).abs().toString().slice(0, 7)

    this.spreadsheetService.getFields(spreadsheetFile, spreadsheetMediaInformation.idField, userID, fields)
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
      if (enteredValue != null && compare(enteredValue, value, decimals)) {
        correct = true
        correctCount += 1
      }
      result = result.appended(CheckResult(key, value, enteredValue, correct))
    }

    (correctCount, result.toList)
  }

  private def generateResultText(results: Seq[CheckResult]): String = {
    val count = results.size
    val correct = results.foldLeft(0)((acc: Int, result: CheckResult) => if (result.correct) {
      acc + 1
    } else {
      acc
    })

    s"$correct von $count Eingaben richtig."
  }

  private def submittSubTasks(configurationId: Int, submissionId: Int, results: Seq[SpreadsheetCheckerService.this.CheckResult],
                              points: Option[Seq[(String, String)]]): Unit = {
    val pointsMap = points.map(p => p.toMap)
    for (CheckResult(key, _, _, correct) <- results) {
      val maxPoints = pointsMap.flatMap(pm => pm.get(key))
        .flatMap(str => str.toFloatOption).map(flo => flo.toInt)
        .getOrElse(1)
      val points = if (correct) {maxPoints} else {0}

      val subTask = subTaskService.getOrCrate(configurationId, key, maxPoints)
      subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    }
  }

  private def compare(enteredValue: String, value: String, decimals: Int): Boolean = {
    val entered = mathParserService.parse(enteredValue)
    (parseDouble(enteredValue, germanFormat), parseDouble(value, germanFormat)) match {
      case (Some(enteredValue), Some(value)) =>
        round(enteredValue, decimals) == round(value, decimals)
      case _ => enteredValue == value
    }
  }

  private def round(input: Double, toDecimals: Int): String =
    BigDecimal(input).setScale(toDecimals, BigDecimal.RoundingMode.HALF_UP).toString()

  private def parseDouble(input: String, format: NumberFormat): Option[Double] = {
    val position = new ParsePosition(0)
    val parsed = try Option(format.parse(input, position)) catch {
      case _: ParseException => None
    }
    // Check if full string is parsed and return None for invalid input
    if (position.getIndex == input.length) {
      parsed.map(x => x.doubleValue())
    } else {
      None
    }
  }

  private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

  private case class CheckResult(name: String, expected: String, entered: String, correct: Boolean)
}
