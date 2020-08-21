package de.thm.ii.fbs.model

import java.util.Date

/**
  * Users meta datate for a submission to a task.
  * @param submissionTime The time this submission was made
  * @param exitCode The exitcode of the check script, if 0, then the submission was a success
  * @param resultText The result text of the submission
  * @param checked If true then the submission was checked by the system
  * @param id The submission id
  */
case class Submission(submissionTime: Date, exitCode: Int, resultText: String, checked: Boolean, id: Int)
