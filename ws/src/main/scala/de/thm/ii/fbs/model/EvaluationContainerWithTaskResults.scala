package de.thm.ii.fbs.model

/**
  * Evaluation Container with Task results
  * @param id the Container id
  * @param tasks  the Container tasks with results
  * @param toPass point to pass
  * @param bonusFormula formula that calculate bonus Points
  * @param hidePoints hide points
  */
case class EvaluationContainerWithTaskResults(id: Integer, tasks: List[TaskResult],
                                              toPass: Integer,
                                              bonusFormula: String, hidePoints: Boolean)
