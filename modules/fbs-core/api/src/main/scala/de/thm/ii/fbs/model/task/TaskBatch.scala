package de.thm.ii.fbs.model.task

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.model.Task

case class TaskBatch(@JsonProperty("taskIds") val taskIds: List[Int], @JsonProperty("task") val task: Task)
