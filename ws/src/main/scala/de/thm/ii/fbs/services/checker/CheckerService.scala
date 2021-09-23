package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, User}

/**
  * The trait representing the checker
  */
trait CheckerService {
  /**
    * Notify about the new submission
    * @param taskID the taskID for the submission
    * @param submissionID the id of the sumission
    * @param cc the check runner of the sumission
    * @param fu the user which triggered the sumission
    */
  def notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit
}
