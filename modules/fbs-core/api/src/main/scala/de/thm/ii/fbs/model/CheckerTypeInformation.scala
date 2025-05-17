package de.thm.ii.fbs.model

import org.json.{JSONException, JSONObject}

object CheckerTypeInformation {
  /**
    * Gets a MediaInformation fromJSON
    * @param json the JSON
    * @return the MediaInformation
    */
  def fromJSONString(json: String): CheckerTypeInformation = {
    val obj = new JSONObject(json)
    obj.getString("type") match {
      case "sqlCheckerInformation" => SqlCheckerInformation (obj.getString ("solution"), obj.getBoolean ("showHints"),
        obj.getInt ("showHintsAt"), obj.getBoolean ("showExtendedHints"), obj.getInt ("showExtendedHintsAt"), obj.optBoolean("disableDistance", true) )
      case _ => throw new IllegalArgumentException()
    }
  }

  /**
    * Converts a MediaInformation to JSON
    * @param obj The MediaInformation
    * @return The JSON
    */
  def toJSONString(obj: CheckerTypeInformation): String =
    obj match {
      case sobj: SqlCheckerInformation =>
        new JSONObject()
          .put("type", "sqlCheckerInformation")
          .put("solution", sobj.solution)
          .put("showHints", sobj.showHints)
          .put("showHintsAt", sobj.showHintsAt)
          .put("showExtendedHints", sobj.showExtendedHints)
          .put("showExtendedHintsAt", sobj.showExtendedHintsAt)
          .put("disableDistance", sobj.disableDistance)
          .toString
      case _ =>
        throw new IllegalArgumentException()
    }
}

/**
  * An abstract class represendinc checker type dependent information for checkrunner configuration
  */
abstract sealed class CheckerTypeInformation

/**
  * The SQL-Checker Information
  *
  * @param solution the solution
  * @param showHints if true show hints
  * @param showHintsAt after what amount of attempts to show hints
  * @param showExtendedHints if true show extended hints
  * @param showExtendedHintsAt after what amount of attempts to show extended hints
  */
case class SqlCheckerInformation(
  solution: String,
  showHints: Boolean,
  showHintsAt: Int,
  showExtendedHints: Boolean,
  showExtendedHintsAt: Int,
  disableDistance: Boolean,
) extends CheckerTypeInformation
