package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.{JsonProperty}

case class TaskExport(@JsonProperty ("task")task: Task, @JsonProperty ("configs")configs: List[ConfigExport])

case class ConfigExport(@JsonProperty ("config")config: CheckrunnerConfiguration, @JsonProperty ("subTasks")subTasks: List[CheckrunnerSubTask],
                        @JsonProperty ("mainFile")mainFile: Option[String], @JsonProperty ("secondaryFile")secondaryFile: Option[String])
