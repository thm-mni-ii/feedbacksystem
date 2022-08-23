package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * Class to store the Runner Args
  *
  * @param taskId     the taskId for that Runner
  * @param runner     the runner Configuration
  * @param submission the Submission Configuration
  */
class RunArgs(@JsonProperty("taskId") val taskId: Int,
              @JsonProperty("runner") val runner: Runner,
              @JsonProperty("submission") val submission: Submission)
