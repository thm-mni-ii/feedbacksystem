package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

import scala.jdk.CollectionConverters.ListHasAsScala

case class Response(
  equal: Seq[Boolean]
)

object Response {
  def fromJson(body: String): Response = {
    val objs = new JSONObject(body)
    Response(objs.getJSONArray("equal").toList.asScala.toSeq.asInstanceOf[Seq[Boolean]])
  }
}
