package de.thm.ii.fbs.model

/**
  * Represents a TaskResult to be view by the user
  * @param taskID The ID of the task the result is for
  * @param points The points
  * @param maxPoints The max amount of points
  */
case class UserTaskResult (taskID: Int, points: Int, maxPoints: Int)
