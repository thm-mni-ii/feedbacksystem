package de.thm.ii.fbs.model

/**
  * The CheckrunnerResult for a SubTask
  * @param configurationId The configurationId (part of primary key)
  * @param subTaskId The subTaskId (part of primary key)
  * @param submissionId The submissionId (part of primary key)
  * @param points The archived points
  */
case class CheckrunnerSubTaskResult(configurationId: Int, subTaskId: Int, submissionId: Int, points: Int)
