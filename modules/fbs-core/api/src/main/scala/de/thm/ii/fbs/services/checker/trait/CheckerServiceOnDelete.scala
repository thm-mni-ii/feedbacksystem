package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.CheckrunnerConfiguration
import de.thm.ii.fbs.model.task.Task

trait CheckerServiceOnDelete {
  def onCheckerConfigurationDelete(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit
}
