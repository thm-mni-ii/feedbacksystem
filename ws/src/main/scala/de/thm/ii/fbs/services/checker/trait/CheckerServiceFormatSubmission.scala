package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission}

trait CheckerServiceFormatSubmission {
  def format(submissionID: Submission, checkrunnerConfiguration: CheckrunnerConfiguration, solution: String): Any
}
