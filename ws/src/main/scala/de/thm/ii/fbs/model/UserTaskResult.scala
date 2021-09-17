package de.thm.ii.fbs.model

/**
  * Represents a TaskResult to be view by the user
  * @param taskID The ID of the task the result is for
  * @param points The points
  * @param maxPoints The max amount of points
  * @param passed true when the task has been passed
  * @param submission if a submission was found
  */
case class UserTaskResult (taskID: Int, points: Int, maxPoints: Int, passed: Boolean, submission: Boolean)
