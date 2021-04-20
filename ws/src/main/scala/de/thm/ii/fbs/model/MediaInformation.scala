package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import org.json.JSONObject

/**
  * The MediaInformation
  */
abstract sealed class MediaInformation

object MediaInformation {
  def fromJSONString(json: String): MediaInformation = {
    val obj = new JSONObject(json)
    if (obj.getString("type") == "spreadsheetMediaInformation") {
      SpreadsheetMediaInformation(obj.getString("idField"), obj.getString("inputFields"), obj.getString("outputFields"))
    } else {
      throw new IllegalArgumentException()
    }
  }
  def toJSONString(obj: MediaInformation): String =
    obj match {
      case sobj: SpreadsheetMediaInformation =>
        new JSONObject()
          .put("type", "spreadsheetMediaInformation")
          .put("idField", sobj.idField)
          .put("inputFields", sobj.inputFields)
          .put("outputFields", sobj.outputFields)
          .toString
      case sobj: SpreadsheetResponseInformation =>
        new JSONObject()
          .put("inputs", sobj.inputs)
          .put("outputs", sobj.outputs)
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
                                       outputFields: String) extends MediaInformation

case class SpreadsheetResponseInformation(inputs: Seq[(String, String)], outputs: Seq[String]) extends MediaInformation

