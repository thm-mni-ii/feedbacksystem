package de.thm.ii.fbs.model.checker

import tools.jackson.databind.JsonNode

trait Submission {
  val id: Int
  val user: User
  def toJson: JsonNode
}
