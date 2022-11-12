package de.thm.ii.fbs.util

import de.thm.ii.fbs.types.OutputJsonStructure
import io.vertx.core.json.{JsonArray, JsonObject}

/**
  * Service to Transform the Database Information Results to an Json Object
  */
object DatabaseInformationService {
  /**
    * Builds the Output Json based an the given structure
    *
    * @param result    the Results to transform
    * @param structure the Output Structure definitioon
    * @return the Results transformed to the Output Structure
    */
  def buildOutputJson(result: JsonObject, structure: List[OutputJsonStructure]): JsonObject = {
    val output = new JsonObject()
    var currentResult = result

    structure.foreach(s => {
      buildSubResult(currentResult, output, s)
      currentResult = currentResult.getJsonObject("next", new JsonObject())
    })

    output
  }

  private def buildSubResult(result: JsonObject, output: JsonObject, structure: OutputJsonStructure): JsonObject = {
    val values: JsonArray = if (result == null) {
      new JsonArray()
    } else {
      result.getJsonArray("rows", new JsonArray())
    }

    values.forEach(v => parseSubJson(v.asInstanceOf[JsonObject], structure))
    output.put(structure.key, values)
  }

  private def parseSubJson(result: JsonObject, structure: OutputJsonStructure): JsonObject = {
    val subJson = result.remove("json").asInstanceOf[String]
    if (subJson != null) {
      result.put(structure.jsonSubKey.getOrElse("json"), new JsonArray(subJson))
    }

    result
  }
}
