package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.JSONObject

import scala.jdk.CollectionConverters.SeqHasAsJava

case class Request(
                    environment: String,
                    solutions: Seq[SolutionRequest],
                    submission: String
                              ) {
  def toJson: JSONObject =
    new JSONObject()
      .put("environment", environment)
      .put("solutions", solutions.map(_.toJson).asJava)
      .put("submission", submission)
}
