package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

case class SolutionRequest(
                     query: String,
                     rowNormalisation: String,
                     columnNormalisation: String,
                     returnResultSet: Boolean
                   ) {
  def toJson: JSONObject =
    new JSONObject()
      .put("query", query)
      .put("row_normalisation", rowNormalisation)
      .put("column_normalisation", columnNormalisation)
      .put("return_result_set", returnResultSet)
}
