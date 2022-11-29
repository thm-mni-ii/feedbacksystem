package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.{JsonIgnore, JsonProperty}

/**
 * The CheckrunnerResult for a SubTask
 *
 * @param configurationId The configurationId (part of primary key)
 * @param subTaskId       The subTaskId (part of primary key)
 * @param name            the name of the subtask
 * @param points          The archivable points
 */
case class CheckrunnerSubTask(@JsonIgnore configurationId: Int,
                              @JsonIgnore subTaskId: Int,
                              @JsonProperty name: String,
                              @JsonProperty points: Int)
