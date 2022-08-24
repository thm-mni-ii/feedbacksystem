package de.thm.ii.fbs.model

/**
  *  Anomized results of a course from an task
  * @param submission The submission of the user
  * @param passed Was the task passed?
  * @param resultText The result of the test
  * @param userId An identification number for the user.
  *               However, this does not correspond to the correct userId, but is incremented during creation.
  * @param attempt Attempt number
  */
case class AnalysisCourseResult(var submission: String = "", passed: Boolean, resultText: String, userId: Int, attempt: Int)
