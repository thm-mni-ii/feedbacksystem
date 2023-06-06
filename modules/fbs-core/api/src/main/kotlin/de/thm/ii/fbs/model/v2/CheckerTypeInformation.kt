package de.thm.ii.fbs.model.v2

import org.json.JSONObject

object CheckerTypeInformationObj {
    /**
     * Gets a MediaInformation fromJSON
     * @param json the JSON
     * @return the MediaInformation
     */
    fun fromJSONString(json: String): CheckerTypeInformation {
        val obj = JSONObject(json)
        return when (obj.getString("type")) {
            "sqlCheckerInformation" -> SqlCheckerInformation (obj.getString ("solution"), obj.getBoolean ("showHints"),
                    obj.getInt ("showHintsAt"), obj.getBoolean ("showExtendedHints"), obj.getInt ("showExtendedHintsAt") )
            else -> throw IllegalArgumentException()
        }
    }

    /**
     * Converts a MediaInformation to JSON
     * @param obj The MediaInformation
     * @return The JSON
     */
    fun toJSONString(obj: CheckerTypeInformation): String {
        return when (obj) {
            is SqlCheckerInformation -> JSONObject()
                    .put("type", "sqlCheckerInformation")
                    .put("solution", obj.solution)
                    .put("showHints", obj.showHints)
                    .put("showHintsAt", obj.showHintsAt)
                    .put("showExtendedHints", obj.showExtendedHints)
                    .put("showExtendedHintsAt", obj.showExtendedHintsAt)
                    .toString()
            else -> throw IllegalArgumentException()
        }
    }
}

/**
 * An abstract class represendinc checker type dependent information for checkrunner configuration
 */
sealed class CheckerTypeInformation

/**
 * The SQL-Checker Information
 *
 * @param solution the solution
 * @param showHints if true show hints
 * @param showHintsAt after what amount of attempts to show hints
 * @param showExtendedHints if true show extended hints
 * @param showExtendedHintsAt after what amount of attempts to show extended hints
 */
data class SqlCheckerInformation(
        val solution: String,
        val showHints: Boolean,
        val showHintsAt: Int,
        val showExtendedHints: Boolean,
        val showExtendedHintsAt: Int
) : CheckerTypeInformation()
