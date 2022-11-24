package de.thm.ii.fbs.services.checker.excel

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, ExcelMediaInformationTasks}
import de.thm.ii.fbs.services.persistence.StorageService
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.io.File

@Service
class SpreadsheetFileService {
  @Autowired
  private val storageService: StorageService = null
  private val objectMapper: ObjectMapper = new ScalaObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  def getMediaInfo(ccId: Int): ExcelMediaInformationTasks = {
    val secondaryFilePath = this.storageService.pathToSecondaryFile(ccId).get.toString
    val file = new File(secondaryFilePath)
    objectMapper.readValue(file, classOf[ExcelMediaInformationTasks])
  }

  def getSubmissionFile(submissionID: Int, cc: CheckrunnerConfiguration): File = {
    if (cc.isInBlockStorage) {
      val tmpFile = new File("solution-file")
      storageService.getFileFromBucket("submissions", s"${cc.taskId}/solution-file", "solution-file")
      tmpFile
    } else {
      val submissionPath = this.storageService.pathToSolutionFile(submissionID).get.toString
      new File(submissionPath)
    }
  }

  def getSolutionFile(cc: CheckrunnerConfiguration): File = {
    if (cc.isInBlockStorage) {
      val tmpFile = new File("main-file")
      storageService.getFileFromBucket("tasks", s"${cc.taskId}/main-file", "main-file")
      tmpFile
    } else {
      val mainFilePath = this.storageService.pathToMainFile(cc.id).get.toString
      new File(mainFilePath)
    }
  }
}
