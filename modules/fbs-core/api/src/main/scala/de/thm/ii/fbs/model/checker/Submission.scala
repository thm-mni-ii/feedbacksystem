package de.thm.ii.fbs.model.checker

import com.fasterxml.jackson.databind.JsonNode

trait Submission {
  val id: Int
  val user: User
  def toJson: JsonNode
}
