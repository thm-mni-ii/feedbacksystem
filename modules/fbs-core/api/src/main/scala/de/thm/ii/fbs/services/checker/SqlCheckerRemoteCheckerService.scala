package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model
import de.thm.ii.fbs.model.checker.SqlCheckerState
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, SqlCheckerInformation, Submission => FBSSubmission}
import de.thm.ii.fbs.services.persistence._
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.util.concurrent.ConcurrentHashMap

object SqlCheckerRemoteCheckerService {
  private val isCheckerRun = new ConcurrentHashMap[Int, SqlCheckerState.Value]()
  private val extInfo = new ConcurrentHashMap[Int, String]()
}

abstract class SqlCheckerRemoteCheckerService(@Value("${services.masterRunner.insecure}") insecure: Boolean) extends RemoteCheckerService(insecure) {
  @Autowired
  private val userService: UserService = null

  /**
    * Notify the runner about a new submission
    *
    * @param taskID       the id of the task to check
    * @param submissionID the id of the submission to check
    * @param cc           the CheckrunnerConfiguration to use
    * @param fu           the User model
    */
  override def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: model.User): Unit = {
    if (SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submissionID, SqlCheckerState.Runner) != SqlCheckerState.Runner) {
      notifyChecker(taskID, submissionID, cc, fu)
    } else {
      super.notify(taskID, submissionID, cc.copy(checkerType = "sql"), fu)
    }
  }

  protected def notifyChecker(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: model.User): Unit

  /**
    * Handles a result
    *
    * @param submission           The submission
    * @param checkerConfiguration The check runner configuration
    * @param task                 The task
    * @param exitCode             The exit Code of the runner
    * @param resultText           The resultText of the runner
    * @param extInfo              Extended runner information
    */
  override def handle(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                      resultText: String, extInfo: String): Unit = {
    SqlCheckerRemoteCheckerService.isCheckerRun.getOrDefault(submission.id, SqlCheckerState.Runner) match {
      case SqlCheckerState.Runner =>
        SqlCheckerRemoteCheckerService.isCheckerRun.put(submission.id, SqlCheckerState.Checker)
        if (exitCode == 2) {
          if (extInfo != null) {
            SqlCheckerRemoteCheckerService.extInfo.put(submission.id, extInfo)
          }
          this.notify(task.id, submission.id, checkerConfiguration, userService.find(submission.userID.get).get)
        } else {
          SqlCheckerRemoteCheckerService.isCheckerRun.put(submission.id, SqlCheckerState.Ignore)
          storeResult(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
        }
      case SqlCheckerState.Checker =>
        SqlCheckerRemoteCheckerService.isCheckerRun.remove(submission.id)
        val extInfo = SqlCheckerRemoteCheckerService.extInfo.remove(submission.id)
        this.handleChecker(submission, checkerConfiguration, task, 2, resultText, extInfo)
      case SqlCheckerState.Ignore =>
        SqlCheckerRemoteCheckerService.isCheckerRun.remove(submission.id)
    }
  }

  protected def handleChecker(submission: FBSSubmission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int,
                              resultText: String, extInfo: String): Unit = storeResult(submission, checkerConfiguration, task, exitCode, resultText, extInfo)
}
