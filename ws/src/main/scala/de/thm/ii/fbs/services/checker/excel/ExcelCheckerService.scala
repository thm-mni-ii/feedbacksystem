package de.thm.ii.fbs.services.checker.excel

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, ExcelMediaInformation, ExtendedInfoExcel, User}
import de.thm.ii.fbs.services.checker.CheckerService
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
    val excelMediaInformation = this.getMediaInfo(cc.id)
    val submission = this.submissionService.getOne(submissionID, fu.id).get
    val submissionFile = this.getSubmissionFile(submission.id)
    val mainFile = this.getMainFile(cc.id)

    try {
      val userRes = this.excelService.getFields(submissionFile, excelMediaInformation)
      val expectedRes = this.excelService.getFields(mainFile, excelMediaInformation)

      val res = this.compare(userRes, expectedRes)
      val exitCode = if (res._1) {
        0
      } else {
        1
      }
      val resultText = if (res._1) "OK" else f"Die Zelle/-n '${res._2.mkString(", ")}' enthalten nicht das Korrekte ergebnis"
      submissionService.storeResult(submissionID, cc.id, exitCode, resultText, objectMapper.writeValueAsString(res._3))
    } catch {
      case e: NotImplementedFunctionException => submissionService.storeResult(submissionID, cc.id, 1, f"Invalid Function: '${e.getMessage}", null)
      case e: Throwable => submissionService.storeResult(submissionID, cc.id, 1, f"Fehler: '${e.getMessage}'", null)
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

  private def compare(userRes: Seq[(String, XSSFCell)], expectedRes: Seq[(String, XSSFCell)]): (Boolean, List[String], ExtendedInfoExcel) = {
    var invalidFields = List[String]()
    val extInfo = ExtendedInfoExcel()

    val res = expectedRes.zip(userRes).map(p => {
      val equal = p._1._1.contentEquals(p._2._1)
      if (!equal) {
        invalidFields :+= p._1._2.getReference
        extInfo.expected.rows.append(List(p._1._2.getReference, p._1._1))
        extInfo.result.rows.append(List(p._1._2.getReference, p._2._1))
      }
      equal
      // forall cannot be used directly, otherwise it will be aborted at the first wrong entry.
    }).forall(p => p)

    (res, invalidFields, extInfo)
  }

  private def getMediaInfo(ccId: Int): ExcelMediaInformation = {
    val secondaryFilePath = this.storageService.pathToSecondaryFile(ccId).get.toString
    val file = new File(secondaryFilePath)
    objectMapper.readValue(file, classOf[ExcelMediaInformation])
  }
}
