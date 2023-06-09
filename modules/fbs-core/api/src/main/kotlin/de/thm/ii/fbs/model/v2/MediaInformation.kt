package de.thm.ii.fbs.model.v2

import org.json.JSONObject

/**
 * The MediaInformation
 */
sealed class MediaInformation

/**
 * The companion object for MediaInformation
 */
object MediaInformationObj {
    /**
     * Gets a MediaInformation fromJSON
     *
     * @param json the JSON
     * @return the MediaInformation
     */
    fun fromJSONString(json: String): MediaInformation {
        val obj = JSONObject(json)
        if (obj.getString("type") == "spreadsheetMediaInformation") {
            return SpreadsheetMediaInformation(obj.getString("idField"), obj.getString("inputFields"),
                    obj.getString("outputFields"), obj.getString("pointFields"), obj.getInt("decimals"))
            } else {
                throw IllegalArgumentException()
            }
        }

    /**
     * Converts a MediaInformation to JSON
     *
     * @param obj The MediaInformation
     * @return The JSON
     */
    fun toJSONString(obj: MediaInformation): String {
        return when (obj) {
            is SpreadsheetMediaInformation -> JSONObject()
                    .put("type", "spreadsheetMediaInformation")
                    .put("idField", obj.idField)
                    .put("inputFields", obj.inputFields)
                    .put("outputFields", obj.outputFields)
                    .putOpt("pointFields", obj.pointFields)
                    .put("decimals", obj.decimals)
                    .toString()
            is SpreadsheetResponseInformation -> JSONObject()
                    .put("inputs", obj.inputs)
                    .put("outputs", obj.outputs)
                    .put("decimals", obj.decimals)
                    .put("mediaInformation", toJSONString(obj.mediaInformation))
                    .toString()
            else -> throw IllegalArgumentException()
        }
    }
}

data class ExcelMediaInformationTasks(val tasks: List<ExcelMediaInformation>, val enableExperimentalFeatures: Boolean = false)

data class ExcelMediaInformation(val sheetIdx: Int, val changeFields: List<ExcelMediaInformationChange> = listOf(),
    @Deprecated("Use checkFields instead") val outputFields: String, val checkFields: List<ExcelMediaInformationCheck> = listOf(),
    val name: String, val hideInvalidFields: Boolean = false): MediaInformation()

data class ExcelMediaInformationChange(val cell: String, val newValue: String, val sheetIdx: Int)

data class ExcelMediaInformationCheck(val range: String, val hideInvalidFields: Boolean = false, val errorMsg: String = "")

/**
 * The Spreadsheet Media Information
 *
 * @param idField      the idField
 * @param inputFields  the inputFields
 * @param outputFields the outputFields
 * @param pointFields  the pointFields
 * @param decimals     the amount of decimals to round to
 */
data class SpreadsheetMediaInformation(val idField: String,
    val inputFields: String,
    val outputFields: String,
    val pointFields: String?,
    val decimals: Int): MediaInformation()

/**
 * The Spreadsheet Media Information
 *
 * @param inputs           the inputs
 * @param outputs          the outputs
 * @param decimals         the amount of decimals to round to
 * @param mediaInformation the mediaInformation
 */
data class SpreadsheetResponseInformation(val inputs: Sequence<Pair<String, String>>, val outputs: Sequence<String>, val decimals: Int,
    val mediaInformation: SpreadsheetMediaInformation): MediaInformation()
