package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonSubTypes.Type
import com.fasterxml.jackson.annotation.{JsonSubTypes, JsonTypeInfo}
import com.sun.xml.bind.v2.runtime.unmarshaller.LocatorEx.Snapshot
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
        obj.getInt ("showHintsAt"), obj.getBoolean ("showExtendedHints"), obj.getInt ("showExtendedHintsAt") )
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
          .toString
      case _ =>
        throw new IllegalArgumentException()
    }
}

/**
  * An abstract class represendinc checker type dependent information for checkrunner configuration
  */
@JsonTypeInfo(
  use = JsonTypeInfo.Id.NAME,
  include = JsonTypeInfo.As.PROPERTY,
  property = "type"
)
@JsonSubTypes(Array(
  new Type(value = classOf[SqlCheckerInformation], name = "sqlCheckerInformation"),
))
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
  showExtendedHintsAt: Int
) extends CheckerTypeInformation
