package de.thm.ii.fbs.model

/**
  *  Course evaluation results
  * @param user User to the results
  * @param passed is the Course Passed
  * @param bonusPoints earned bonus points
  * @param results Evaluation Container with results
  */
case class EvaluationUserResult(user: User, passed: Boolean, bonusPoints: Int, results: List[EvaluationContainerResult])
