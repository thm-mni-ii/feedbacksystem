package de.thm.ii.fbs.model

/**
  * A summarized result of a student for a task
  *
  * @param task The task
  * @param attempts The attempts made to solve it
  * @param passed True if task was passed
  */
case class TaskResult(task: Task, attempts: Int, passed: Boolean) extends Ordered[TaskResult] {
  /**
    * Compares TaskResults by Task Id.
    * @param that TaskResult to be compared with
    * @return comparing int
    */
  override def compare(that: TaskResult): Int = this.task.id.compare(that.task.id)
}
