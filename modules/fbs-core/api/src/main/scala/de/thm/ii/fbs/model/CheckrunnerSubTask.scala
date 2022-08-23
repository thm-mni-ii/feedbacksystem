package de.thm.ii.fbs.model

/**
  * The CheckrunnerResult for a SubTask
  * @param configurationId The configurationId (part of primary key)
  * @param subTaskId The subTaskId (part of primary key)
  * @param name the name of the subtask
  * @param points The archivable points
  */
case class CheckrunnerSubTask(configurationId: Int, subTaskId: Int, name: String, points: Int)
