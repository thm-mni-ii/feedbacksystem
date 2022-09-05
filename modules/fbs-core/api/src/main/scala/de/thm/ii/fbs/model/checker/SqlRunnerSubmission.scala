package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}

case class SqlRunnerSubmission(id: Int, user: User, solutionFileLocation: String, subTaskFileLocation: String)
  extends Submission {
  /**
    * Transforms RunnerConfiguration to JsonNode
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("id", this.id)
    json.set("user", this.user.toJson)
    json.put("solutionFileLocation", this.solutionFileLocation)
    json.put("subTaskFileLocation", this.subTaskFileLocation)
    json
  }
}
