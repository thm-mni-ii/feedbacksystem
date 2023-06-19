package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission}

trait CheckerServiceHandle {
  def handle(submission: Submission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int, resultText: String, extInfo: String): Unit
}
