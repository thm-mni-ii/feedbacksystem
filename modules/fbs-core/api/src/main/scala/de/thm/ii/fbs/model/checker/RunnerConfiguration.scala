package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model.checker
import de.thm.ii.fbs.model.checker.RunnerConfigurationFilesType.RunnerConfigurationFilesType

case class RunnerConfiguration(id: Int,
                               typ: String,
                               files: RunnerConfigurationFiles
                              ) {
  /**
    * Transforms RunnerConfiguration to JsonNode
    *
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("id", this.id)
    json.put("type", this.typ)
    json.set("files", this.files.toJson)
    json
  }
}

case class RunnerConfigurationFiles(typ: RunnerConfigurationFilesType, mainFile: Option[String], secondaryFile: Option[String]) {
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("type", this.typ.toString)
    addOptionToJson(json, this.mainFile, "mainFile")
    addOptionToJson(json, this.secondaryFile, "secondaryFile")
    json
  }

  private def addOptionToJson(json: ObjectNode, value: Option[String], key: String) = {
    json.put(f"has${key.capitalize}", value.isDefined)

    if (value.isDefined) {
      json.put(key, value.get)
    }
  }
}

object RunnerConfigurationFilesType extends Enumeration {
  type RunnerConfigurationFilesType = Value

  val PATH: checker.RunnerConfigurationFilesType.Value = Value("path")
  val URL: checker.RunnerConfigurationFilesType.Value = Value("url")
}
