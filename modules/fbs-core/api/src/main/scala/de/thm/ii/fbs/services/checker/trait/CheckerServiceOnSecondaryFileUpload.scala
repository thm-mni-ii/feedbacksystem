package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.CheckrunnerConfiguration
import de.thm.ii.fbs.model.task.Task

trait CheckerServiceOnSecondaryFileUpload {
  def onCheckerSecondaryFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit
}
