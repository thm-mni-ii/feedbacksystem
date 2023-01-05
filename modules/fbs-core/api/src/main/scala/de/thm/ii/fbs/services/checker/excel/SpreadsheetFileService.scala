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

  def getMediaInfo(cc: CheckrunnerConfiguration): ExcelMediaInformationTasks = {
    val content = this.storageService.getSecondaryFileContent(cc)
    objectMapper.readValue(content, classOf[ExcelMediaInformationTasks])
  }

  def getSubmissionFile(submissionID: Int, cc: CheckrunnerConfiguration): File = {
    storageService.getFileSolutionFile(cc, submissionID)
  }

  def getMainFile(cc: CheckrunnerConfiguration): File = {
    storageService.getFileMainFile(cc)
  }

  def cleanup(cc: CheckrunnerConfiguration, file: File): Unit = {
    if (cc.isInBlockStorage) {
      file.delete()
    }
  }

  def cleanup(cc: CheckrunnerConfiguration, mainFile: File, submissionFile: File): Unit = {
    if (cc.isInBlockStorage) {
      mainFile.delete()
      submissionFile.delete()
    }
  }
}
