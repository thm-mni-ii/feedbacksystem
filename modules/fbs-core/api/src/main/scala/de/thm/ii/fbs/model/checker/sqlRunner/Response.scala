package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

case class Response(
                                 solutions: Seq[SolutionResponse],
                                 submissionResultSet: Option[ResultSet]
                               )
object Response {
  def fromJson(body: String): Response = {
    val obj = new JSONObject(body)
    if (obj.has("error")) {
      throw ResponseParseException(obj.optString("location", ""), obj.getString("error"))
    }
    val solutionsArr = obj.getJSONArray("solutions")
    val solutions = (0 until solutionsArr.length()).map { i =>
      SolutionResponse.fromJson(solutionsArr.getJSONObject(i))
    }
    val submissionResultSet =
      if (obj.has("submission_result_set") && !obj.isNull("submission_result_set"))
        { Some(ResultSet.fromJson(obj.getJSONObject("submission_result_set"))) }
      else { None }
    Response(solutions, submissionResultSet)
  }

  case class ResponseParseException(location: String, error: String) extends Exception(s"$location: $error")
}
