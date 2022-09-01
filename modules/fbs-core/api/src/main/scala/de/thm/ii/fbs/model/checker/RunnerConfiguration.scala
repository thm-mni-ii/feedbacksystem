package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}

case class RunnerConfiguration(id: Int, typ: String,
                                         mainFileLocation: Option[String], hasSecondaryFile: Boolean,
                                         secondaryFileLocation: Option[String]) {
  /**
    * Transforms RunnerConfiguration to JsonNode
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("id", this.id)
    json.put("type", this.typ)
    this.mainFileLocation match {
      case Some(mainFileLocation) => json.put("mainFileLocation", mainFileLocation)
      case None => json.putNull("mainFileLocation")
    }
    json.put("hasSecondaryFile", this.hasSecondaryFile)
    this.secondaryFileLocation match {
      case Some(secondaryFileLocation) => json.put("secondaryFileLocation", secondaryFileLocation)
      case None => json.putNull("secondaryFileLocation")
    }
    json
  }
}
