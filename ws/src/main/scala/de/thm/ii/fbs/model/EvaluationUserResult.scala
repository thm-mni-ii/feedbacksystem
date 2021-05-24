package de.thm.ii.fbs.model

/**
  *  Course evaluation results
  * @param user User to the results
  * @param passed is the Course Passed
  * @param bonusPoints earned bonus points
  * @param containerResults Evaluation Container with results
  */
case class EvaluationUserResult(user: User, passed: Boolean, bonusPoints: Int, containerResults: List[EvaluationContainerResult])
