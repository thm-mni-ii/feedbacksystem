package de.thm.ii.fbs.services.checker.excel

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.checker.excel.SpreadsheetCell
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.v2.checker.excel.result.ExcelCheckerResultData
import de.thm.ii.fbs.services.checker.`trait`.{CheckerService, CheckerServiceOnMainFileUpload, CheckerServiceOnSecondaryFileUpload}
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, SubmissionService}
import de.thm.ii.fbs.services.v2.checker.excel.{ErrorAnalysisSolutionService, ExcelCheckerServiceV2}
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.apache.poi.ss.formula.eval.NotImplementedFunctionException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.stereotype.Service

import java.io.File
import scala.collection.convert.ImplicitConversions.`collection AsScalaIterable`

@Service
class ExcelCheckerService extends CheckerService with CheckerServiceOnMainFileUpload with CheckerServiceOnSecondaryFileUpload {
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val excelService: ExcelService = null
  @Autowired
  private val subTaskService: CheckrunnerSubTaskService = null
  @Autowired
  private val spreadsheetFileService: SpreadsheetFileService = null
  @Autowired
  private val excelCheckerServiceV2: ExcelCheckerServiceV2 = null
  @Autowired
  private val errorAnalysisSolutionService: ErrorAnalysisSolutionService = null
  private val objectMapper: ObjectMapper = new ScalaObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  private val logger = LoggerFactory.getLogger(this.getClass)

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
      val submission = this.submissionService.getOne(submissionID, fu.id).get
      val submissionFile = this.spreadsheetFileService.getSubmissionFile(submission)
      val mainFile = this.spreadsheetFileService.getMainFile(cc)

      executeChecker(cc, submission, submissionFile, mainFile)
    } catch {
      case e: Throwable =>
        logger.error("Bei der Überprüfung des Excel-Checkers ist ein Fehler aufgetreten", e)
        storeError(submissionID, cc, e.getMessage)
    }
  }

  override def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    try {
      // Delete stored solution to force the Checker to regenerate it on the next check
      errorAnalysisSolutionService.deleteSolution(checkerConfiguration.id)
    } catch {
      // TODO: May find better solution with a version field
      case _: ObjectOptimisticLockingFailureException => // Ignore if the row was already deleted by a parallel running update
    }
  }

  override def onCheckerSecondaryFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit = {
    onCheckerMainFileUpload(cid, task, checkerConfiguration)
  }

  private def executeChecker(cc: CheckrunnerConfiguration, submission: Submission, submissionFile: File, mainFile: File): Unit = {
    try {
      val excelMediaInformation = this.spreadsheetFileService.getMediaInfo(cc)
      val submissionResult = checkSubmission(cc: CheckrunnerConfiguration, excelMediaInformation, submissionFile, mainFile)
      submissionResult match {
        case res: SubmissionResultV1 =>
          val resultText = this.buildResultText(res.exitCode == 0, res.results, excelMediaInformation)
          submissionService.storeResult(submission.id, cc.id, res.exitCode, resultText,
            objectMapper.writeValueAsString(this.buildExtendedRes(res.mergedResults, excelMediaInformation))
          )
          this.submitSubTasks(cc.id, submission.id, res.mergedResults, excelMediaInformation)
        case res: SubmissionResultV2 =>
          submissionService.storeResult(submission.id, cc.id, res.exitCode, "See Result Data",
            objectMapper.writeValueAsString(this.buildExtendedRes(res)), Option(res.results)
          )
      }

    } catch {
      case e: Throwable =>
        logger.error("Bei der Überprüfung des Excel-Checkers ist ein Fehler aufgetreten", e)
        storeError(submission.id, cc, e.getMessage)
    } finally {
      this.spreadsheetFileService.cleanup(cc, mainFile, submissionFile)
    }
  }

  private def checkSubmission(cc: CheckrunnerConfiguration,
                              excelMediaInformation: ExcelMediaInformationTasks,
                              submissionFile: File,
                              solutionFile: File): SubmissionResult = {
    if (excelMediaInformation.enableExperimentalFeatures) {
      checkSubmissionExperimental(cc, excelMediaInformation, submissionFile, solutionFile)
    } else {
      val results = excelMediaInformation.tasks.map(t => this.checkTask(solutionFile, submissionFile, t))
      val mergedResults = results.map(r => r.checkResult.reduce(mergeCheckResult))
      SubmissionResultV1(if (results.forall(r => r.success)) 0 else 1, results, mergedResults)
    }
  }

  private def checkSubmissionExperimental(cc: CheckrunnerConfiguration,
                                          excelMediaInformation: ExcelMediaInformationTasks,
                                          submissionFile: File,
                                          solutionFile: File): SubmissionResultV2 = {
    val solution = excelService.initWorkBook(solutionFile, excelMediaInformation) // TODO: do only if needed
    val submission = excelService.initWorkBook(submissionFile, excelMediaInformation)
    val config = excelMediaInformation.toExcelCheckerConfiguration
    val result = excelCheckerServiceV2.check(cc.id, config, solution, submission)

    SubmissionResultV2(if (result.getPassed) 0 else 1, result)
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
      case e: ExcelCheckerException => generateCheckResultError(e.getMessage)
      case e: Throwable => generateCheckResultError("Bei der Überprüfung ist ein Fehler aufgetreten: '%s'", e.getMessage)
    }
  }

  private def getFields(
                         submissionFile: File,
                         mainFile: File,
                         excelMediaInformation: ExcelMediaInformation,
                         checkFields: ExcelMediaInformationCheck
                       ): CellsComparator = {
    val expectedRes = this.excelService.getFields(mainFile, excelMediaInformation, checkFields)
    val userRes = try {
      this.excelService.getFields(submissionFile, excelMediaInformation, checkFields)
    } catch {
      case _: NullPointerException => Seq.fill(expectedRes.length)(SpreadsheetCell("", ""))
    }

    CellsComparator(userRes, expectedRes)
  }

  private def compare(cells: CellsComparator): CheckResult = {
    var invalidFields = List[String]()
    val extInfo = ExtendedInfoExcel.newV1

    val res = cells.expectedCells.zip(cells.actualCell).foldLeft(true)({ case (accumulator, (expected, actual)) =>
      val equal = actual.value.contentEquals(expected.value)
      if (!equal) {
        invalidFields :+= actual.reference
        extInfo.result.rows.append(List(actual.reference, actual.value))
        extInfo.expected.rows.append(List(actual.reference, expected.value))
      }
      accumulator && equal
    })

    CheckResult(res, invalidFields, extInfo)
  }

  private def generateCheckResultError(errorMsg: String, args: Any*): CheckResultTask = {
    CheckResultTask(success = false, List(CheckResult(errorMsg = errorMsg.format(args))))
  }

  private def storeError(submissionID: Int, cc: CheckrunnerConfiguration, errorMsg: String): Unit = {
    submissionService.storeResult(submissionID, cc.id, 1, f"Bei der Überprüfung ist ein Fehler aufgetretten: '$errorMsg'", null)
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
    results.zip(excelMediaInformation.tasks).foldLeft(ExtendedInfoExcel.newV1)((r, t) => {
      r.result.rows.append(List(f"Unteraufgabe ${t._2.name}", "-"))
      if (t._1.errorMsg.nonEmpty) r.result.rows.append(List("⚠️ Fehler", t._1.errorMsg))
      r.result.rows.appendAll(t._1.extendedInfoExcel.result.rows)

      r.expected.rows.append(List(f"Unteraufgabe ${t._2.name}", "-"))
      if (t._1.errorMsg.nonEmpty) r.expected.rows.append(List("⚠️ Fehler", t._1.errorMsg))
      r.expected.rows.appendAll(t._1.extendedInfoExcel.expected.rows)
      r
    })
  }

  private def buildExtendedRes(result: SubmissionResultV2): ExtendedInfoExcel = {
    result.results.getExercises.foldLeft(ExtendedInfoExcel.newV2)((r, t) => {
      r.result.rows.append(List(f"Unteraufgabe ${t.getName}", "-", "-", "-"))
      val subRows = t.getErrorCell.map(c => List(c.getCellName, c.getValue, c.getFormula, c.isPropagated.toString))
      r.result.rows.appendAll(subRows)

      r.expected.rows.append(List(f"Unteraufgabe ${t.getName}", "-", "-"))
      val solRows = t.getErrorCell.map(c => List(c.getCellName, c.getSolution.getValue, c.getSolution.getFormula))
      r.expected.rows.appendAll(solRows)
      r
    })
  }

  private def submitSubTasks(configurationId: Int, submissionId: Int, results: List[CheckResult],
                             excelMediaInformation: ExcelMediaInformationTasks): Unit = {
    results.zip(excelMediaInformation.tasks).foreach({ case (r, ex) =>
      val points = if (r.success) 1 else 0

      val subTask = subTaskService.getOrCrate(configurationId, ex.name, 1)
      subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    })
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
                         extendedInfoExcel: ExtendedInfoExcel = ExtendedInfoExcel.newV1,
                         errorMsg: String = "")

  abstract class SubmissionResult

  case class SubmissionResultV1(exitCode: Int, results: List[CheckResultTask], mergedResults: List[CheckResult]) extends SubmissionResult

  case class SubmissionResultV2(exitCode: Int, results: ExcelCheckerResultData) extends SubmissionResult

  case class CellsComparator(expectedCells: Seq[SpreadsheetCell], actualCell: Seq[SpreadsheetCell])
}
