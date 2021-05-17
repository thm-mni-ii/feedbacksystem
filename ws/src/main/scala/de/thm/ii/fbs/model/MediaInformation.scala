package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import org.json.JSONObject

/**
  * The MediaInformation
  */
abstract sealed class MediaInformation

/**
  * The companion object for MediaInformation
  */
object MediaInformation {
  /**
    * Gets a MediaInformation fromJSON
    * @param json the JSON
    * @return the MediaInformation
    */
  def fromJSONString(json: String): MediaInformation = {
    val obj = new JSONObject(json)
    if (obj.getString("type") == "spreadsheetMediaInformation") {
      SpreadsheetMediaInformation(obj.getString("idField"), obj.getString("inputFields"), obj.getString("outputFields"), obj.getInt("decimals"))
    } else {
      throw new IllegalArgumentException()
    }
  }

  /**
    * Converts a MediaInformation to JSON
    * @param obj The MediaInformation
    * @return The JSON
    */
  def toJSONString(obj: MediaInformation): String =
    obj match {
      case sobj: SpreadsheetMediaInformation =>
        new JSONObject()
          .put("type", "spreadsheetMediaInformation")
          .put("idField", sobj.idField)
          .put("inputFields", sobj.inputFields)
          .put("outputFields", sobj.outputFields)
          .put("decimals", sobj.decimals)
          .toString
      case sobj: SpreadsheetResponseInformation =>
        new JSONObject()
          .put("inputs", sobj.inputs)
          .put("outputs", sobj.outputs)
          .put("decimals", sobj.decimals)
          .toString
      case _ =>
        throw new IllegalArgumentException()
    }
}

/**
  * The Spreadsheet Media Information
  *
  * @param idField the idField
  * @param inputFields the inputFields
  * @param outputFields the outputFields
  */
case class SpreadsheetMediaInformation(idField: String,
                                       inputFields: String,
                                       outputFields: String,
                                       decimals: Int) extends MediaInformation

/**
  * The Spreadsheet Media Information
  * @param inputs the inputs
  * @param outputs the outputs
  */
case class SpreadsheetResponseInformation(inputs: Seq[(String, String)], outputs: Seq[String], decimals: Int) extends MediaInformation

