package de.thm.ii.fbs.services.v2.checker.trait

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.Task

interface CheckerServiceOnMainFileUpload {
    fun onCheckerMainFileUpload(cid: Int, task: Task, checkerConfiguration: CheckrunnerConfiguration)
}