package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Task}

trait CheckerServiceOnDelete {
  def onCheckerConfigurationDelete(task: Task, checkerConfiguration: CheckrunnerConfiguration): Unit
}
