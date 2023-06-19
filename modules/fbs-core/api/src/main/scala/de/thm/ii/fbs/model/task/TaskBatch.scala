package de.thm.ii.fbs.model.task

import com.fasterxml.jackson.annotation.JsonProperty

case class TaskBatch(@JsonProperty("taskIds") val taskIds: List[Int], @JsonProperty("task") val task: PartialTask)
