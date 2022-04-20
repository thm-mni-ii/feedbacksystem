package de.thm.ii.fbs.services.checker.excel

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, User}
import de.thm.ii.fbs.services.checker.CheckerService
import de.thm.ii.fbs.services.persistence.{CheckrunnerSubTaskService, StorageService, SubmissionService, TaskService}
import org.slf4j.LoggerFactory
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
  private val spreadsheetService: SpreadsheetService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val subTaskService: CheckrunnerSubTaskService = null
  private val logger = LoggerFactory.getLogger(this.getClass)


  /**
    * Notify about the new submission
    *
    * @param taskID       the taskID for the submission
    * @param submissionID the id of the sumission
    * @param cc           the check runner of the sumission
    * @param fu           the user which triggered the sumission
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit = {
    val task = this.taskService.getOne(taskID).get
    val submission = this.submissionService.getOne(submissionID, fu.id).get
    val submissionFile = this.getSubmissionFile(submission.id)

    submissionService.storeResult(submissionID, cc.id, 0, "", null)
  }

  private def getSubmissionFile(submissionID: Int): File = {
    val submissionPath = this.storageService.pathToSolutionFile(submissionID).get.toString
    new File(submissionPath)
  }
}
