package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}

case class User(id: Int, username: String) {
  /**
    * Transforms User to JsonNode
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("id", this.id)
    json.put("username", this.username)
    json
  }
}
