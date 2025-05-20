package de.thm.ii.fbs.model.checker.assa

import org.json.{JSONArray, JSONObject}

import scala.collection.convert.ImplicitConversions.`iterator asScala`

case class Response(correct: Boolean, feedback: String)

object Response {
  def fromJsonList(body: String): Seq[Response] = {
    val objs = new JSONArray(body)
    objs.iterator().map(o => {
      val obj = o.asInstanceOf[JSONObject]
      Response(obj.getBoolean("correct"), obj.getString("feedback"))
    }).toSeq
  }
}
