package de.thm.ii.fbs.model

import de.thm.ii.fbs.model.v2.checker.excel.configuration._
import org.json.{JSONException, JSONObject}

import scala.jdk.CollectionConverters.SeqHasAsJava

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
    *
    * @param json the JSON
    * @return the MediaInformation
    */
  def fromJSONString(json: String): MediaInformation = {
    val obj = new JSONObject(json)
    if (obj.getString("type") == "spreadsheetMediaInformation") {
      SpreadsheetMediaInformation(obj.getString("idField"), obj.getString("inputFields"),
        obj.getString("outputFields"), try Some(obj.getString("pointFields")) catch {
          case _: JSONException => None
        }, obj.getInt("decimals"))
    } else {
      throw new IllegalArgumentException()
    }
  }

  /**
    * Converts a MediaInformation to JSON
    *
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
          .putOpt("pointFields", sobj.pointFields.orNull)
          .put("decimals", sobj.decimals)
          .toString
      case sobj: SpreadsheetResponseInformation =>
        new JSONObject()
          .put("inputs", sobj.inputs)
          .put("outputs", sobj.outputs)
          .put("decimals", sobj.decimals)
          .put("mediaInformation", toJSONString(sobj.mediaInformation))
          .toString
      case _ =>
        throw new IllegalArgumentException()
    }
}

case class ExcelMediaInformationTasks(tasks: List[ExcelMediaInformation], enableExperimentalFeatures: Boolean = false) {
  def toExcelCheckerConfiguration: ExcelCheckerConfiguration = new ExcelCheckerConfiguration(
    tasks.map(t => t.toExcelCheckerConfiguration).asJava, enableExperimentalFeatures)
}

case class ExcelMediaInformation(sheetIdx: Int, changeFields: List[ExcelMediaInformationChange] = List(),
                                 @deprecated("Use checkFields instead") outputFields: String, checkFields: List[ExcelMediaInformationCheck] = List(),
                                 name: String, hideInvalidFields: Boolean = false) extends MediaInformation {
  def toExcelCheckerConfiguration: ExcelTaskConfiguration =
    new ExcelTaskConfiguration(
      sheetIdx,
      changeFields.map(f => f.toExcelCheckerConfiguration).asJava,
      checkFields.map(f => f.toExcelCheckerConfiguration).asJava,
      name,
      hideInvalidFields
    )
}

case class ExcelMediaInformationChange(cell: String, newValue: String, sheetIdx: Int) {
  def toExcelCheckerConfiguration: ExcelTaskConfigurationChange = new ExcelTaskConfigurationChange(cell, newValue, sheetIdx)
}

case class ExcelMediaInformationCheck(range: String, hideInvalidFields: Boolean = false, errorMsg: String = "") {
  def toExcelCheckerConfiguration: ExcelTaskConfigurationCheck =
    new ExcelTaskConfigurationCheck(range, hideInvalidFields, errorMsg)
}

/**
  * The Spreadsheet Media Information
  *
  * @param idField      the idField
  * @param inputFields  the inputFields
  * @param outputFields the outputFields
  * @param pointFields  the pointFields
  * @param decimals     the amount of decimals to round to
  */
case class SpreadsheetMediaInformation(idField: String,
                                       inputFields: String,
                                       outputFields: String,
                                       pointFields: Option[String],
                                       decimals: Int) extends MediaInformation

/**
  * The Spreadsheet Media Information
  *
  * @param inputs           the inputs
  * @param outputs          the outputs
  * @param decimals         the amount of decimals to round to
  * @param mediaInformation the mediaInformation
  */
case class SpreadsheetResponseInformation(inputs: Seq[(String, String)], outputs: Seq[String], decimals: Int,
                                          mediaInformation: SpreadsheetMediaInformation) extends MediaInformation
