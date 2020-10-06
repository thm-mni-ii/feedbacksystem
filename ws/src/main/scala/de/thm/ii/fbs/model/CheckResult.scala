package de.thm.ii.fbs.model

/**
  * Check result of a single check
  * @param exitCode Exit code of the check
  * @param resultText Output text of the checker
  * @param checkerType The cheker type that checked the submission
  * @param configurationId Checker configuration id
  */
case class CheckResult(exitCode: Int = 1, resultText: String, checkerType: String, configurationId: Int)
