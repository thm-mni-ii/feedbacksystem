package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

import scala.jdk.CollectionConverters.ListHasAsScala

case class Response(
  equal: Seq[Boolean]
)

object Response {
  def fromJson(body: String): Response = {
    val objs = new JSONObject(body)
    if (objs.has("error")) {
      throw ResponseParseException(objs.getString("location"), objs.getString("error"))
    }
    Response(objs.getJSONArray("equal").toList.asScala.toSeq.asInstanceOf[Seq[Boolean]])
  }

  case class ResponseParseException(location: String, error: String) extends Exception
}
