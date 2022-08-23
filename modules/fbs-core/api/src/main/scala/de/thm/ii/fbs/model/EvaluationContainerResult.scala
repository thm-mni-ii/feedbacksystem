package de.thm.ii.fbs.model

/**
  * Evaluation Container with Results
  * @param passed is the Container Passed
  * @param bonusPoints earned bonus points
  * @param passedTasks number of Passed Tasks
  * @param container  Evaluation Container with results
  */
case class EvaluationContainerResult(passed: Boolean, bonusPoints: Int, passedTasks: Int, container: EvaluationContainerWithTaskResults)
