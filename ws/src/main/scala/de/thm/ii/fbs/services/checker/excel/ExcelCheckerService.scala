package de.thm.ii.fbs.services.checker.excel

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, ExcelMediaInformation, ExcelMediaInformationTasks, ExtendedInfoExcel, User}
import de.thm.ii.fbs.services.checker.`trait`.CheckerService
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService, TaskService}
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.apache.poi.ss.formula.eval.NotImplementedFunctionException
import org.apache.poi.xssf.usermodel.XSSFCell
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.io.File

@Service
class ExcelCheckerService extends CheckerService {
  @Autowired
  private val taskService: TaskService = null
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
      val mainFile = this.getMainFile(cc.id)

      val results = excelMediaInformation.tasks.map(t => this.checkTask(mainFile, submissionFile, t))
      val exitCode = if (results.forall(r => r.success)) {
        0
      } else {
        1
      }

      val resultText = this.buildResultText(exitCode == 0, results, excelMediaInformation)
      submissionService.storeResult(
        submissionID, cc.id, exitCode, resultText, objectMapper.writeValueAsString(this.buildExtendedRes(results, excelMediaInformation))
      )
      this.submitSubTasks(cc.id, submission.id, results, excelMediaInformation)
    } catch {
      case e: Throwable => submissionService.storeResult(submissionID, cc.id, 0, f"Bei der Überprüfung ist ein Fehler aufgetretten: '${e.getMessage}'", null)
    }
  }

  private def checkTask(submissionFile: File, mainFile: File, excelMediaInformation: ExcelMediaInformation): CheckResult = {
    try {
      val userRes = this.excelService.getFields(submissionFile, excelMediaInformation)
      val expectedRes = this.excelService.getFields(mainFile, excelMediaInformation)

      this.compare(userRes, expectedRes)
    } catch {
      case e: NotImplementedFunctionException => CheckResult(errorMsg = f"Die Excel-Funktion '${e.getMessage}' wird nicht unterstützt")
      case _: NullPointerException => CheckResult(errorMsg = "Ungültige Konfiguration")
      case e: Throwable => CheckResult(errorMsg = f"Bei der Überprüfung ist ein Fehler aufgetretten: '${e.getMessage}'")
    }
  }

  private def getSubmissionFile(submissionID: Int): File = {
    val submissionPath = this.storageService.pathToSolutionFile(submissionID).get.toString
    new File(submissionPath)
  }

  private def getMainFile(ccId: Int): File = {
    val mainFilePath = this.storageService.pathToMainFile(ccId).get.toString
    new File(mainFilePath)
  }

  private def compare(userRes: Seq[(String, XSSFCell)], expectedRes: Seq[(String, XSSFCell)]): CheckResult = {
    var invalidFields = List[String]()
    val extInfo = ExtendedInfoExcel()

    val res = expectedRes.zip(userRes).map(p => {
      val equal = p._2._1.contentEquals(p._1._1)
      if (!equal) {
        invalidFields :+= p._2._2.getReference
        extInfo.result.rows.append(List(p._2._2.getReference, p._1._1))
        extInfo.expected.rows.append(List(p._2._2.getReference, p._2._1))
      }
      equal
      // forall cannot be used directly, otherwise it will be aborted at the first wrong entry.
    }).forall(p => p)

    CheckResult(res, invalidFields, extInfo)
  }

  private def buildResultText(success: Boolean,
                              results: List[CheckResult],
                              excelMediaInformation: ExcelMediaInformationTasks): String = {
    if (success) {
      "OK"
    } else {
      var correct = 0
      val hints = results.zip(excelMediaInformation.tasks).map(t => {
        if (t._1.success) correct += 1
        t
      }).filter(t => !t._2.hideInvalidFields && !t._1.success).map(t => {
        if (t._1.errorMsg.nonEmpty) {
          f"${t._2.name}: ${t._1.errorMsg}"
        } else {
          f"${t._2.name}: Die Zelle/-n '${t._1.invalidFields.mkString(", ")}' enthalten nicht das korrekte Ergebnis"
        }
      }).mkString("\n")
      val res = f"$correct von ${results.length} Unteraufgaben richtig."

      if (hints.nonEmpty) {
        f"$res\n\nHinweise:\n$hints"
      } else {
        res
      }
    }
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
      val points = if (r._1.success) {1} else {0}

      val subTask = subTaskService.getOrCrate(configurationId, r._2.name, 1)
      subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    })
  }

  private def getMediaInfo(ccId: Int): ExcelMediaInformationTasks = {
    val secondaryFilePath = this.storageService.pathToSecondaryFile(ccId).get.toString
    val file = new File(secondaryFilePath)
    objectMapper.readValue(file, classOf[ExcelMediaInformationTasks])
  }

  case class CheckResult(success: Boolean = false,
                          invalidFields: List[String] = List(),
                          extendedInfoExcel: ExtendedInfoExcel = ExtendedInfoExcel(),
                          errorMsg: String = "")
}
