package de.thm.ii.fbs.model

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}

/**
  * Validate Formula result Object
  *
  * @param result the Formula check result
  * @param msg    the result message
  */
class ValidateFormula(val result: Boolean, val msg: String) {
  /**
    * Transforms ValidateFormular to JsonNode
    *
    * @return json representation
    */
  def toJson: JsonNode = {
    val json = new ObjectMapper().createObjectNode()
    json.put("valid", this.result)
    json.put("message", this.msg)

    json
  }
}
