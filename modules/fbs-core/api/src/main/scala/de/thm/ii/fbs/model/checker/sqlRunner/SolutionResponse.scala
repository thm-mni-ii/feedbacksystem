package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

case class SolutionResponse(
                             eq: Boolean,
                             resultSet: Option[ResultSet]
                           )
object SolutionResponse {
  def fromJson(js: JSONObject): SolutionResponse = {
    val eq = js.getBoolean("eq")
    val resultSet = if (js.has("result_set") && !js.isNull("result_set"))
      { Some(ResultSet.fromJson(js.getJSONObject("result_set"))) }
    else { None }
    SolutionResponse(eq, resultSet)
  }
}
