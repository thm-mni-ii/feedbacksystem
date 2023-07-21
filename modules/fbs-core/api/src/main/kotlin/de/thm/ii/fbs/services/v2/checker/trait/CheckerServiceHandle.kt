package de.thm.ii.fbs.services.v2.checker.trait

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.Submission
import de.thm.ii.fbs.model.v2.Task

interface CheckerServiceHandle {
    fun handle(submission: Submission, checkerConfiguration: CheckrunnerConfiguration, task: Task, exitCode: Int, resultText: String, extInfo: String)
}