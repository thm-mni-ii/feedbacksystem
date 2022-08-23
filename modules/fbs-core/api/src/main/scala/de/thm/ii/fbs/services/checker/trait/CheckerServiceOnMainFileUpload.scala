package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Task}

import java.nio.file.Path

trait CheckerServiceOnMainFileUpload {
  def onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration, mainFile: Path): Unit
}
