package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}

case class RunnerRequest(taskID: Int,
                                   runnerConfiguration: RunnerConfiguration,
                                   submission: Submission) {
  /**
    * Transforms RunnerRequest to JsonNode
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("taskId", this.taskID)
    json.set("runner", this.runnerConfiguration.toJson)
    json.set("submission", this.submission.toJson)
    json
  }
}
