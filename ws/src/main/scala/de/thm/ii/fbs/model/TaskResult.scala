package de.thm.ii.fbs.model

/**
  * A summarized result of a student for a task
  * @param task The task
  * @param attempts The attempts made to solve it
  * @param passed True if task was passed
  */
case class TaskResult(task: Task, attempts: Int, passed: Boolean)
