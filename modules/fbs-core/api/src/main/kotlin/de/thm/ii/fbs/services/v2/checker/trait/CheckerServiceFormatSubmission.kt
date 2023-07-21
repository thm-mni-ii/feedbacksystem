package de.thm.ii.fbs.services.v2.checker.trait

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.Submission

interface CheckerServiceFormatSubmission {
    fun formatSubmission(submissionID: Submission, checkrunnerConfiguration: CheckrunnerConfiguration, solution: String): Any
}