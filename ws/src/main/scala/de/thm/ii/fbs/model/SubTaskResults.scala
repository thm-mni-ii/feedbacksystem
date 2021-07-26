package de.thm.ii.fbs.model

import org.json.JSONObject

/**
  * SubTaskResults returned by a runner
  * @param name The name of the subtask
  * @param maxPoints The maximal amount of points the subtask can give
  * @param points The amount of points given for this result
  */
case class SubTaskResults(name: String, maxPoints: Int, points: Int)

/**
  * The companion object for SubTaskResults
  */
object SubTaskResults {
  /**
    * Gets a SubTaskResults fromJSON
    * @param obj the JSON Object
    * @return the SubTaskResults
    */
  def fromJSON(obj: JSONObject): SubTaskResults =
    SubTaskResults(obj.getString("name"), obj.getInt("maxPoints"), obj.getInt("points"))
}
