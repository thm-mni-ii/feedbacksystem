package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

import scala.jdk.CollectionConverters.SeqHasAsJava

case class Request(environment: String, solutions: Seq[java.util.List[String]], submission: String) {
  def toJson: JSONObject =
    new JSONObject()
      .put("environment", environment)
      .put("solutions", solutions.asJava)
      .put("submission", submission)
}
