package de.thm.ii.fbs.model

/**
  * Evaluation Container object
  *
  * @param id           the Container id
  * @param tasks        the Container tasks
  * @param toPass       point to pass
  * @param bonusFormula formula that calculate bonus Points
  * @param hidePoints   hide points
  */
case class EvaluationContainer(id: Integer = -1, tasks: List[Task] = List.empty,
                               toPass: Integer,
                               bonusFormula: String, hidePoints: Boolean)
