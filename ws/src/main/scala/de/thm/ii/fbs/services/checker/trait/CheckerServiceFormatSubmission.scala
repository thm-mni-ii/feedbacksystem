package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission}

trait CheckerServiceFormatSubmission {
  def formatSubmission(submissionID: Submission, checkrunnerConfiguration: CheckrunnerConfiguration, solution: String): Any
}
