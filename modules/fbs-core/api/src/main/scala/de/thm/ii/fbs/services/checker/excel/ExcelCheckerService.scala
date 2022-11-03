package de.thm.ii.fbs.services.checker.excel

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.checker.excel.SpreadsheetCell
import de.thm.ii.fbs.services.checker.`trait`.CheckerService
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService}
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.apache.poi.ss.formula.eval.NotImplementedFunctionException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.io.File

@Service
class ExcelCheckerService extends CheckerService {
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val excelService: ExcelService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val subTaskService: CheckrunnerSubTaskService = null
  private val objectMapper: ObjectMapper = new ScalaObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  /**
    * Notify about the new submission
    *
    * @param taskID       the taskID for the submission
    * @param submissionID the id of the submission
    * @param cc           the check runner of the submission
    * @param fu           the user which triggered the submission
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    try {
      val excelMediaInformation = this.getMediaInfo(cc.id)
      val submission = this.submissionService.getOne(submissionID, fu.id).get
      val submissionFile = this.getSubmissionFile(submission.id)
      val solutionFile = this.getSolutionFile(cc.id)

      val submissionResult = checkSubmission(excelMediaInformation, submissionFile, solutionFile)
      val resultText = this.buildResultText(submissionResult.exitCode == 0, submissionResult.results, excelMediaInformation)
      submissionService.storeResult(submissionID, cc.id, submissionResult.exitCode, resultText,
        objectMapper.writeValueAsString(this.buildExtendedRes(submissionResult.mergedResults, excelMediaInformation))
      )
      this.submitSubTasks(cc.id, submission.id, submissionResult.mergedResults, excelMediaInformation)
    } catch {
      case e: Throwable => storeError(submissionID, cc, e.getMessage)
    }
  }

  private def checkSubmission(excelMediaInformation: ExcelMediaInformationTasks, submissionFile: File, solutionFile: File): SubmissionResult = {
    val results = excelMediaInformation.tasks.map(t => this.checkTask(solutionFile, submissionFile, t))
    val mergedResults = results.map(r => r.checkResult.reduce(mergeCheckResult))
    SubmissionResult(if (results.forall(r => r.success)) {
      0
    } else {
      1
    }, results, mergedResults)
  }

  private def checkTask(submissionFile: File, mainFile: File, excelMediaInformation: ExcelMediaInformation): CheckResultTask = {
    try {
      // If Config file is old -> use old field names
      if (excelMediaInformation.checkFields.isEmpty && excelMediaInformation.outputFields.nonEmpty) {
        val res = this.compare(this.getFields(submissionFile, mainFile, excelMediaInformation,
          ExcelMediaInformationCheck(range = excelMediaInformation.outputFields, hideInvalidFields = excelMediaInformation.hideInvalidFields)
        ))

        CheckResultTask(res.success, List(res))
      } else {
        val res = excelMediaInformation.checkFields
          .map(c => getFields(submissionFile, mainFile, excelMediaInformation, c))
          .map(compare)
        CheckResultTask(res.forall(r => r.success), res)
      }
    } catch {
      case e: NotImplementedFunctionException => generateCheckResultError("Die Excel-Funktion '%s' wird nicht unterstützt", e.getMessage)
      case _: NullPointerException => generateCheckResultError("Ungültige Konfiguration")
      case e: Throwable => generateCheckResultError("Bei der Überprüfung ist ein Fehler aufgetreten: '%s'", e.getMessage)
    }
  }

  private def getFields(
                         submissionFile: File,
                         mainFile: File,
                         excelMediaInformation: ExcelMediaInformation,
                         checkFields: ExcelMediaInformationCheck
                       ): CellsComparator = {
    val userRes = this.excelService.getFields(submissionFile, excelMediaInformation, checkFields)
    val expectedRes = this.excelService.getFields(mainFile, excelMediaInformation, checkFields)

    CellsComparator(userRes, expectedRes)
  }

  private def compare(cells: CellsComparator): CheckResult = {
    var invalidFields = List[String]()
    val extInfo = ExtendedInfoExcel()


    val res = cells.expectedCells.zip(cells.actualCell).foldLeft(true)({ case (accumulator, (expected, actual)) =>
      val equal = actual.value.contentEquals(expected.value)
      if (!equal) {
        invalidFields :+= actual.reference
        extInfo.result.rows.append(List(actual.reference, expected.value))
        extInfo.expected.rows.append(List(actual.reference, actual.value))
      }
      accumulator && equal
    })

    CheckResult(res, invalidFields, extInfo)
  }

  private def generateCheckResultError(errorMsg: String, args: Any*): CheckResultTask = {
    CheckResultTask(success = false, List(CheckResult(errorMsg = errorMsg.format(args))))
  }

  private def storeError(submissionID: Int, cc: CheckrunnerConfiguration, errorMsg: String): Unit = {
    submissionService.storeResult(submissionID, cc.id, 0, f"Bei der Überprüfung ist ein Fehler aufgetretten: '$errorMsg'", null)
  }

  private def getSubmissionFile(submissionID: Int): File = {
    val submissionPath = this.storageService.pathToSolutionFile(submissionID).get.toString
    new File(submissionPath)
  }

  private def getSolutionFile(ccId: Int): File = {
    val mainFilePath = this.storageService.pathToMainFile(ccId).get.toString
    new File(mainFilePath)
  }

  private def buildResultText(success: Boolean,
                              results: List[CheckResultTask],
                              excelMediaInformation: ExcelMediaInformationTasks): String = {
    if (success) {
      "OK"
    } else {
      val correct = results.count(c => c.success)
      val hints = results.zip(excelMediaInformation.tasks)
        .filter(t => !t._1.success)
        .map(t => buildTaskResultText(t._1, t._2))
        .mkString("\n")
      val res = f"$correct von ${results.length} Unteraufgaben richtig."

      if (hints.nonEmpty) {
        f"$res\n\nHinweise:\n$hints"
      } else {
        res
      }
    }
  }

  private def buildTaskResultText(result: CheckResultTask, task: ExcelMediaInformation) = {
    if (task.checkFields.isEmpty) {
      buildLegacyTaskResultText(result, task)
    } else {
      result.checkResult.zip(task.checkFields)
        .filter(shouldBuildCheckResult)
        .map(c => buildCheckResult(c._1, c._2, task))
        .mkString("\n")
    }
  }

  private def buildLegacyTaskResultText(result: CheckResultTask, task: ExcelMediaInformation) = {
    if (result.checkResult.head.errorMsg.nonEmpty) {
      f"${task.name}: ${result.checkResult.head.errorMsg}"
    } else {
      f"${task.name}: Die Zellen '${result.checkResult.head.invalidFields.mkString(", ")}' enthalten nicht das korrekte Ergebnis"
    }
  }

  private def buildCheckResult(result: CheckResult, check: ExcelMediaInformationCheck, task: ExcelMediaInformation) = {
    if (result.errorMsg.nonEmpty) {
      f"${task.name}: ${result.errorMsg}"
    } else {
      val errorMsg = if (check.errorMsg.nonEmpty) f"${check.errorMsg}" else ""

      if (check.hideInvalidFields) {
        f"${task.name}: $errorMsg"
      } else {
        f"${task.name}: Die Zellen '${result.invalidFields.mkString(", ")}' enthalten nicht das korrekte Ergebnis. $errorMsg"
      }
    }
  }

  private def shouldBuildCheckResult(c: (CheckResult, ExcelMediaInformationCheck)) = {
    !c._1.success && (!c._2.hideInvalidFields || c._2.errorMsg.nonEmpty || c._1.errorMsg.nonEmpty)
  }

  private def buildExtendedRes(results: List[CheckResult], excelMediaInformation: ExcelMediaInformationTasks) = {
    results.zip(excelMediaInformation.tasks).foldLeft(ExtendedInfoExcel())((r, t) => {
      r.result.rows.append(List(f"Unteraufgabe ${t._2.name}", "-"))
      if (t._1.errorMsg.nonEmpty) r.result.rows.append(List("⚠️ Fehler", t._1.errorMsg))
      r.result.rows.appendAll(t._1.extendedInfoExcel.result.rows)

      r.expected.rows.append(List(f"Unteraufgabe ${t._2.name}", "-"))
      if (t._1.errorMsg.nonEmpty) r.expected.rows.append(List("⚠️ Fehler", t._1.errorMsg))
      r.expected.rows.appendAll(t._1.extendedInfoExcel.expected.rows)
      r
    })
  }

  private def submitSubTasks(configurationId: Int, submissionId: Int, results: List[CheckResult],
                             excelMediaInformation: ExcelMediaInformationTasks): Unit = {
    results.zip(excelMediaInformation.tasks).foreach(r => {
      val points = if (r._1.success) {
        1
      } else {
        0
      }

      val subTask = subTaskService.getOrCrate(configurationId, r._2.name, 1)
      subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    })
  }

  private def getMediaInfo(ccId: Int): ExcelMediaInformationTasks = {
    val secondaryFilePath = this.storageService.pathToSecondaryFile(ccId).get.toString
    val file = new File(secondaryFilePath)
    objectMapper.readValue(file, classOf[ExcelMediaInformationTasks])
  }

  private def mergeCheckResult(c1: CheckResult, c2: CheckResult): CheckResult = {
    CheckResult(c1.success && c2.success,
      c1.invalidFields.appendedAll(c2.invalidFields),
      mergeExtendedInfo(c1.extendedInfoExcel, c2.extendedInfoExcel),
      c1.errorMsg.appendedAll(c2.errorMsg))
  }

  private def mergeExtendedInfo(extRes1: ExtendedInfoExcel, extRes2: ExtendedInfoExcel): ExtendedInfoExcel = {
    ExtendedInfoExcel(expected = mergeExtendedInfoExcelObject(extRes1.expected, extRes2.expected),
      result = mergeExtendedInfoExcelObject(extRes1.result, extRes2.result))
  }

  private def mergeExtendedInfoExcelObject(obj1: ExtendedInfoExcelObject, obj2: ExtendedInfoExcelObject): ExtendedInfoExcelObject = {
    ExtendedInfoExcelObject(rows = obj1.rows ++ obj2.rows, head = obj1.head ++ obj2.head)
  }

  case class CheckResultTask(success: Boolean = false, checkResult: List[CheckResult])

  case class CheckResult(success: Boolean = false,
                         invalidFields: List[String] = List(),
                         extendedInfoExcel: ExtendedInfoExcel = ExtendedInfoExcel(),
                         errorMsg: String = "")

  case class SubmissionResult(exitCode: Int, results: List[CheckResultTask], mergedResults: List[CheckResult])

  case class CellsComparator(expectedCells: Seq[SpreadsheetCell], actualCell: Seq[SpreadsheetCell])
}
