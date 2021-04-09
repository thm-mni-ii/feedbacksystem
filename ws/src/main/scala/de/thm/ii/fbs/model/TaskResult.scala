package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * A summarized result of a student for a task
  *
  * @param task The task
  * @param attempts The attempts made to solve it
  * @param passed True if task was passed
  */
case class TaskResult(@JsonProperty("task") task: Task,
                      @JsonProperty("attempts") attempts: Int,
                      @JsonProperty("passed") passed: Boolean)
