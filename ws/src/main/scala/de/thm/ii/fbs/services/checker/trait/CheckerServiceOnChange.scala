package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Task}

trait CheckerServiceOnChange {
  def onCheckerConfigurationChange(task: Task, checkerConfiguration: CheckrunnerConfiguration,
                                   mainFile: String, secondaryFile: String): Unit
}
